import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/user_model.dart';
import '../../data/auth_remote_datasource.dart';

// ── Events ────────────────────────────────────────────────
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthCheckSessionEvent extends AuthEvent {}

class AuthLoginEvent extends AuthEvent {
  final String email;
  final String password;
  AuthLoginEvent(this.email, this.password);
  @override
  List<Object?> get props => [email];
}

class AuthRegisterEvent extends AuthEvent {
  final String fullName;
  final String email;
  final String phone;
  final String dateOfBirth;
  final String password;
  final UserRole role;
  final String? bloodType;
  final String governorate;
  final String? gender;
  final String? nationalId;
  final double? weight;

  AuthRegisterEvent({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.dateOfBirth,
    required this.password,
    required this.role,
    this.bloodType,
    required this.governorate,
    this.gender,
    this.nationalId,
    this.weight,
  });

  @override
  List<Object?> get props => [email, role, gender, nationalId, weight];
}

class AuthVerifyOtpEvent extends AuthEvent {
  final String email;
  final String? challengeId;
  final String otp;
  final bool isRegistration;
  final Map<String, dynamic>? pendingUserData;

  AuthVerifyOtpEvent({
    required this.email,
    this.challengeId,
    required this.otp,
    this.isRegistration = false,
    this.pendingUserData,
  });

  @override
  List<Object?> get props => [challengeId, otp];
}

class AuthResendOtpEvent extends AuthEvent {
  final String email;
  final String purpose;
  AuthResendOtpEvent(this.email, {this.purpose = 'login'});
  @override
  List<Object?> get props => [email, purpose];
}

class AuthLogoutEvent extends AuthEvent {}

class AuthSetDemoUserEvent extends AuthEvent {
  final UserRole role;
  AuthSetDemoUserEvent(this.role);
  @override
  List<Object?> get props => [role];
}

// ── States ────────────────────────────────────────────────
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthOtpRequiredState extends AuthState {
  final String email;
  final bool isRegistration;
  final Map<String, dynamic>? pendingUserData;
  final String? challengeId;

  AuthOtpRequiredState({
    required this.email,
    this.isRegistration = false,
    this.pendingUserData,
    this.challengeId,
  });

  @override
  List<Object?> get props => [email, isRegistration, challengeId];
}

class AuthAuthenticated extends AuthState {
  final UserModel user;

  AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
  @override
  List<Object?> get props => [message];
}

class AuthRegistrationSucceeded extends AuthState {
  final UserModel user;

  AuthRegistrationSucceeded(this.user);

  @override
  List<Object?> get props => [user];
}

// ── BLoC ──────────────────────────────────────────────────
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRemoteDataSource _dataSource;

  AuthBloc(this._dataSource) : super(AuthInitial()) {
    on<AuthCheckSessionEvent>(_onCheckSession);
    on<AuthLoginEvent>(_onLogin);
    on<AuthRegisterEvent>(_onRegister);
    on<AuthVerifyOtpEvent>(_onVerifyOtp);
    on<AuthResendOtpEvent>(_onResendOtp);
    on<AuthLogoutEvent>(_onLogout);
    on<AuthSetDemoUserEvent>((event, emit) {
      emit(AuthAuthenticated(
        UserModel(
          id: 'demo-user-1',
          fullName: event.role == UserRole.caregiver ? 'د. أحمد فؤاد' : 'دينيش كابور',
          email: 'demo@lifelink.org',
          role: event.role,
          phone: '+201000000000',
        ),
      ));
    });
  }

  Future<void> _onCheckSession(
    AuthCheckSessionEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final token = await _dataSource.getStoredToken();
    if (token == null || token.isEmpty) {
      emit(AuthUnauthenticated());
      return;
    }
    // Token exists — fetch current user from /auth/me to validate
    final result = await _dataSource.getMe();
    if (result is AuthSuccess<UserModel>) {
      await _dataSource.persistSession(token, result.data);
      emit(AuthAuthenticated(result.data));
    } else {
      await _dataSource.clearSession();
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogin(
    AuthLoginEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final loginResult = await _dataSource.login(
      event.email.trim(),
      event.password,
    );
    if (loginResult is AuthFailure<String>) {
      emit(AuthError(loginResult.message));
      return;
    }
    final token = (loginResult as AuthSuccess<String>).data;
    await _dataSource.saveToken(token);
    final meResult = await _dataSource.getMe();
    if (meResult is AuthFailure<UserModel>) {
      await _dataSource.clearSession();
      emit(AuthError(meResult.message));
      return;
    }
    final user = (meResult as AuthSuccess<UserModel>).data;
    await _dataSource.persistSession(
      token,
      user,
    );
    emit(AuthAuthenticated(user));
  }

  Future<void> _onRegister(
    AuthRegisterEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final regResult = await _dataSource.registerUser(
      email: event.email,
      name: event.fullName,
      phone: event.phone,
      dateOfBirth: event.dateOfBirth,
      password: event.password,
      bloodType: event.bloodType,
      governorate: event.governorate,
      gender: event.gender,
      nationalId: event.nationalId,
      weight: event.weight,
    );

    if (regResult is AuthFailure<RegistrationResult>) {
      emit(AuthError((regResult).message));
      return;
    }

    final registration = (regResult as AuthSuccess<RegistrationResult>).data;
    emit(AuthOtpRequiredState(
      email: event.email,
      isRegistration: true,
      challengeId: registration.challengeId,
      pendingUserData: null,
    ));
  }

  Future<void> _onVerifyOtp(
    AuthVerifyOtpEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    if (event.isRegistration) {
      final result = await _dataSource.verifySignup(event.email, event.otp);
      if (result is AuthFailure<UserModel>) {
        emit(AuthError(result.message));
        return;
      }
      final user = (result as AuthSuccess<UserModel>).data;
      emit(AuthRegistrationSucceeded(user));
      return;
    }

    final challengeId = event.challengeId;
    if (challengeId == null || challengeId.isEmpty) {
      emit(AuthError('جلسة OTP غير صالحة، اطلب رمزًا جديدًا'));
      return;
    }
    final verifyResult = await _dataSource.verifyOtp(challengeId, event.otp);
    if (verifyResult is AuthFailure<String>) {
      emit(AuthError(verifyResult.message));
      return;
    }
    final token = (verifyResult as AuthSuccess<String>).data;

    // IMPORTANT: Save token FIRST before calling /auth/me
    await _dataSource.saveToken(token);

    // Fetch user profile from /auth/me with active Bearer token
    final meResult = await _dataSource.getMe();
    UserModel user;
    if (meResult is AuthSuccess<UserModel>) {
      user = meResult.data;
    } else {
      await _dataSource.clearSession();
      emit(AuthError('تعذر تحميل ملف المستخدم من الخادم'));
      return;
    }

    await _dataSource.persistSession(
      token,
      user,
    );
    emit(AuthAuthenticated(user));
  }

  Future<void> _onResendOtp(
    AuthResendOtpEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = event.purpose == 'signup'
        ? await _dataSource.resendSignupOtp(event.email)
        : await _dataSource.requestOtp(event.email, purpose: event.purpose);
    if (result is AuthFailure<Map<String, dynamic>>) {
      emit(AuthError(result.message));
      return;
    }
    emit(AuthOtpRequiredState(
      email: event.email,
      challengeId: (result as AuthSuccess<Map<String, dynamic>>)
          .data['challenge_id'] as String?,
    ));
  }

  Future<void> _onLogout(
    AuthLogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    await _dataSource.logout();
    emit(AuthUnauthenticated());
  }
}
