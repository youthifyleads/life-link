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
  final String phone;
  final String email;
  final String password;
  final UserRole role;
  final String? bloodType;
  final String governorate;

  AuthRegisterEvent({
    required this.fullName,
    required this.phone,
    required this.email,
    required this.password,
    required this.role,
    this.bloodType,
    required this.governorate,
  });

  @override
  List<Object?> get props => [email, phone, role];
}

class AuthVerifyOtpEvent extends AuthEvent {
  final String challengeId;
  final String otp;
  final bool isRegistration;
  final Map<String, dynamic>? pendingUserData;

  AuthVerifyOtpEvent({
    required this.challengeId,
    required this.otp,
    this.isRegistration = false,
    this.pendingUserData,
  });

  @override
  List<Object?> get props => [challengeId, otp];
}

class AuthResendOtpEvent extends AuthEvent {
  final String phoneOrEmail;
  final String purpose;
  AuthResendOtpEvent(this.phoneOrEmail, {this.purpose = 'login'});
  @override
  List<Object?> get props => [phoneOrEmail, purpose];
}

class AuthLogoutEvent extends AuthEvent {}

// ── States ────────────────────────────────────────────────
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthOtpRequiredState extends AuthState {
  final String email;
  final String phone;
  final bool isRegistration;
  final Map<String, dynamic>? pendingUserData;
  final String? challengeId;

  AuthOtpRequiredState({
    required this.email,
    required this.phone,
    this.isRegistration = false,
    this.pendingUserData,
    this.challengeId,
  });

  @override
  List<Object?> get props => [email, phone, isRegistration, challengeId];
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
    await _dataSource.persistSession(token, user);
    emit(AuthAuthenticated(user));
  }

  Future<void> _onRegister(
    AuthRegisterEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final regResult = await _dataSource.registerUser(
      email: event.email,
      fullName: event.fullName,
      password: event.password,
      role: event.role.apiValue,
      phone: event.phone,
      bloodType: event.bloodType,
    );

    if (regResult is AuthFailure<RegistrationResult>) {
      emit(AuthError((regResult).message));
      return;
    }

    final registration = (regResult as AuthSuccess<RegistrationResult>).data;
    emit(AuthOtpRequiredState(
      email: event.email,
      phone: event.phone,
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

    final verifyResult =
        await _dataSource.verifyOtp(event.challengeId, event.otp);
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

    await _dataSource.persistSession(token, user);
    emit(AuthAuthenticated(user));
  }

  Future<void> _onResendOtp(
    AuthResendOtpEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await _dataSource.requestOtp(
      event.phoneOrEmail,
      purpose: event.purpose,
    );
    if (result is AuthFailure<Map<String, dynamic>>) {
      emit(AuthError(result.message));
      return;
    }
    emit(AuthOtpRequiredState(
      email: event.phoneOrEmail,
      phone: event.phoneOrEmail,
      challengeId: (result as AuthSuccess<Map<String, dynamic>>)
          .data['challenge_id'] as String?,
    ));
  }

  Future<void> _onLogout(
    AuthLogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    await _dataSource.clearSession();
    emit(AuthUnauthenticated());
  }
}
