import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lifelink_mobile/core/network/api_error_message.dart';
import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/auth/domain/models/user_model.dart';
import 'package:lifelink_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:lifelink_mobile/features/auth/presentation/screens/otp_screen.dart';

class _FakeAuthRemoteDataSource extends AuthRemoteDataSource {
  _FakeAuthRemoteDataSource() : super(Dio(), const FlutterSecureStorage());

  @override
  Future<AuthResult<RegistrationResult>> registerUser({
    required String email,
    required String fullName,
    required String password,
    required String role,
    required String phone,
    String? bloodType,
  }) async {
    return AuthSuccess(
      RegistrationResult(
        user: UserModel(
          id: 'u_123',
          email: email,
          fullName: fullName,
          role: UserRole.donor,
          phone: phone,
        ),
        challengeId: 'challenge_123',
        expiresInSeconds: 300,
        debugOtp: '123456',
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

    expect(apiErrorMessage(error),
        'رمز التحقق غير صحيح أو منتهي الصلاحية');
  });

  testWidgets('OTP screen enables resend once the countdown is finished',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(_FakeAuthRemoteDataSource()),
          child: const OtpVerificationScreen(
            email: 'donor@example.com',
            phone: '+201234567890',
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
        phone: '+201234567890',
        email: 'donor@example.com',
        password: 'StrongPassword1',
        role: UserRole.donor,
        governorate: 'Cairo',
      ),
    );

    final state = await bloc.stream.firstWhere((state) => state is AuthOtpRequiredState);
    expect(state is AuthOtpRequiredState, isTrue);
    final otpState = state as AuthOtpRequiredState;
    expect(otpState.pendingUserData, isNull);
    expect(otpState.challengeId, 'challenge_123');
  });
}
