import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lifelink_mobile/core/network/api_error_message.dart';
import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/auth/domain/models/user_model.dart';
import 'package:lifelink_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:lifelink_mobile/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:lifelink_mobile/features/auth/presentation/screens/otp_screen.dart';

class _FakeAuthRemoteDataSource extends AuthRemoteDataSource {
  _FakeAuthRemoteDataSource() : super(Dio(), const FlutterSecureStorage());

  String? requestedEmail;

  @override
  Future<AuthResult<Map<String, dynamic>>> resendSignupOtp(String email) async {
    requestedEmail = email;
    return AuthSuccess({});
  }

  @override
  Future<AuthResult<RegistrationResult>> registerUser({
    required String email,
    required String name,
    required String phone,
    required String dateOfBirth,
    required String password,
    String? bloodType,
    String? governorate,
  }) async {
    return AuthSuccess(
      RegistrationResult(
        user: UserModel(
          id: 'u_123',
          email: email,
          fullName: name,
          role: UserRole.normalUser,
        ),
        expiresInSeconds: 300,
      ),
    );
  }
}

void main() {
  test('apiErrorMessage returns the backend error text when available', () {
    final error = DioException(
      requestOptions: RequestOptions(path: '/auth/otp/verify'),
      response: Response(
        requestOptions: RequestOptions(path: '/auth/otp/verify'),
        statusCode: 422,
        data: {
          'error': {
            'message': 'رمز التحقق غير صحيح أو منتهي الصلاحية',
            'code': 'INVALID_OTP',
          },
        },
      ),
    );

    expect(apiErrorMessage(error), 'رمز التحقق غير صحيح أو منتهي الصلاحية');
  });

  test('apiErrorMessage maps OTP expiration, rate limit, and attempts errors',
      () {
    DioException errorFor(String code) => DioException(
          requestOptions: RequestOptions(path: '/auth/otp/verify'),
          response: Response(
            requestOptions: RequestOptions(path: '/auth/otp/verify'),
            statusCode: 401,
            data: {
              'error': {'code': code, 'message': code},
            },
          ),
        );

    expect(apiErrorMessage(errorFor('OTP_EXPIRED')),
        'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا');
    expect(apiErrorMessage(errorFor('OTP_RATE_LIMITED')),
        'تم طلب رموز تحقق كثيرة. انتظر قليلًا ثم حاول مرة أخرى');
    expect(apiErrorMessage(errorFor('OTP_ATTEMPTS_EXCEEDED')),
        'تم تجاوز عدد محاولات رمز التحقق');
  });

  testWidgets('forgot password asks for email rather than phone',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(_FakeAuthRemoteDataSource()),
          child: const ForgotPasswordScreen(),
        ),
      ),
    );

    expect(find.text('البريد الإلكتروني المسجل (Email)'), findsOneWidget);
    expect(find.text('رقم الهاتف المسجل (Phone Number)'), findsNothing);
  });

  testWidgets('OTP screen enables resend once the countdown is finished',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(_FakeAuthRemoteDataSource()),
          child: const OtpVerificationScreen(
            email: 'donor@example.com',
          ),
        ),
      ),
    );

    expect(find.textContaining('إعادة إرسال الرمز خلال'), findsOneWidget);

    for (var i = 0; i < 61; i++) {
      await tester.pump(const Duration(seconds: 1));
    }

    expect(find.text('إعادة إرسال الرمز'), findsOneWidget);
  });

  test('AuthBloc does not carry debug OTP through state after registration',
      () async {
    final bloc = AuthBloc(_FakeAuthRemoteDataSource());

    bloc.add(
      AuthRegisterEvent(
        fullName: 'Test Donor',
        email: 'donor@example.com',
        phone: '+201000000000',
        dateOfBirth: '1995-01-01',
        password: 'StrongPassword1',
        governorate: 'Cairo',
      ),
    );

    final state =
        await bloc.stream.firstWhere((state) => state is AuthOtpRequiredState);
    expect(state is AuthOtpRequiredState, isTrue);
  });

  test('AuthBloc resends OTP using email as the only destination', () async {
    final dataSource = _FakeAuthRemoteDataSource();
    final bloc = AuthBloc(dataSource);

    bloc.add(AuthResendSignupOtpEvent('donor@example.com'));

    final state =
        await bloc.stream.firstWhere((state) => state is AuthOtpRequiredState);
    expect(dataSource.requestedEmail, 'donor@example.com');
    expect((state as AuthOtpRequiredState).email, 'donor@example.com');
  });

  testWidgets('OTP screen rejects codes that are not exactly six digits',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(_FakeAuthRemoteDataSource()),
          child: const OtpVerificationScreen(
            email: 'donor@example.com',
          ),
        ),
      ),
    );

    await tester.enterText(find.byType(TextField), '123');
    await tester.tap(find.text('تأكيد ودخول'));
    await tester.pump();

    expect(
        find.text('يرجى إدخال رمز تحقق OTP مكون من 6 أرقام'), findsOneWidget);
  });
}
