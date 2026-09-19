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
  final String? bloodType;
  final String governorate;

  AuthRegisterEvent({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.dateOfBirth,
    required this.password,
    this.bloodType,
    required this.governorate,
  });

  @override
  List<Object?> get props => [email];
}

class AuthVerifySignupOtpEvent extends AuthEvent {
  final String email;
  final String otp;

  AuthVerifySignupOtpEvent({
    required this.email,
    required this.otp,
  });

  @override
  List<Object?> get props => [email, otp];
}

class AuthResendSignupOtpEvent extends AuthEvent {
  final String email;
  AuthResendSignupOtpEvent(this.email);
  @override
  List<Object?> get props => [email];
}

class AuthLogoutEvent extends AuthEvent {}

class AuthSelectFlowEvent extends AuthEvent {
  final String flow;
  AuthSelectFlowEvent(this.flow);
  @override
  List<Object?> get props => [flow];
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

  AuthOtpRequiredState({
    required this.email,
  });

  @override
  List<Object?> get props => [email];
}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  final String? appFlow;

  AuthAuthenticated(this.user, {this.appFlow});

  @override
  List<Object?> get props => [user, appFlow];
}

class AuthFlowSelectionRequired extends AuthState {
  final UserModel user;
  AuthFlowSelectionRequired(this.user);
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
    on<AuthVerifySignupOtpEvent>(_onVerifySignupOtp);
    on<AuthResendSignupOtpEvent>(_onResendSignupOtp);
    on<AuthLogoutEvent>(_onLogout);
    on<AuthSelectFlowEvent>(_onSelectFlow);
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
      final flow = await _dataSource.getStoredAppFlow(result.data);
      emit(flow == null
          ? AuthFlowSelectionRequired(result.data)
          : AuthAuthenticated(result.data, appFlow: flow));
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
    final flow = await _dataSource.getStoredAppFlow(user);
    emit(flow == null
        ? AuthFlowSelectionRequired(user)
        : AuthAuthenticated(user, appFlow: flow));
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
    );

    if (regResult is AuthFailure<RegistrationResult>) {
      emit(AuthError((regResult).message));
      return;
    }

    emit(AuthOtpRequiredState(
      email: event.email,
    ));
  }

  Future<void> _onVerifySignupOtp(
    AuthVerifySignupOtpEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await _dataSource.verifySignup(event.email, event.otp);
    if (result is AuthFailure<UserModel>) {
      emit(AuthError(result.message));
      return;
    }
    final user = (result as AuthSuccess<UserModel>).data;
    emit(AuthRegistrationSucceeded(user));
    // Fetch user profile from /auth/me with active Bearer token
  }

  Future<void> _onResendSignupOtp(
    AuthResendSignupOtpEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await _dataSource.resendSignupOtp(event.email);
    if (result is AuthFailure<Map<String, dynamic>>) {
      emit(AuthError(result.message));
      return;
    }
    emit(AuthOtpRequiredState(
      email: event.email,
    ));
  }

  Future<void> _onLogout(
    AuthLogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    await _dataSource.logout();
    emit(AuthUnauthenticated());
  }

  Future<void> _onSelectFlow(
    AuthSelectFlowEvent event,
    Emitter<AuthState> emit,
  ) async {
    final current = state;
    if (current is! AuthFlowSelectionRequired) return;
    if (event.flow != 'donor' && event.flow != 'caregiver') return;
    final existingFlow = await _dataSource.getStoredAppFlow(current.user);
    if (existingFlow != null) {
      emit(AuthAuthenticated(current.user, appFlow: existingFlow));
      return;
    }
    await _dataSource.saveAppFlow(current.user, event.flow);
    emit(AuthAuthenticated(current.user, appFlow: event.flow));
  }
}
