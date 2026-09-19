import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/core/constants/api_endpoints.dart';
import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/auth/domain/models/user_model.dart';

class _MockDio extends Mock implements Dio {}

Response<Map<String, dynamic>> _response(
  String path,
  Map<String, dynamic> data,
) {
  return Response(
    requestOptions: RequestOptions(path: path),
    data: data,
  );
}

void main() {
  late _MockDio dio;
  late AuthRemoteDataSource dataSource;

  setUp(() {
    dio = _MockDio();
    dataSource = AuthRemoteDataSource(
      dio,
      const FlutterSecureStorage(),
    );
  });

  test('signup sends the backend email OTP request schema', () async {
    final signupData = {
      'email': 'new.user@example.com',
      'name': 'New User',
      'phone': '+201000000001',
      'date_of_birth': '1995-01-01',
      'password': 'StrongPassword1',
      'blood_type': 'O+',
      'governorate': 'Cairo',
    };
    when(() => dio.post(ApiEndpoints.register, data: signupData)).thenAnswer(
      (_) async => _response(ApiEndpoints.register, {
        'message': 'Account created. Verification code sent to email.',
        'user_id': 'user-1',
        'email': 'new.user@example.com',
        'email_verification_required': true,
      }),
    );

    final result = await dataSource.registerUser(
      email: 'new.user@example.com',
      name: 'New User',
      phone: '+201000000001',
      dateOfBirth: '1995-01-01',
      password: 'StrongPassword1',
      bloodType: 'O+',
      governorate: 'Cairo',
    );

    expect(result, isA<AuthSuccess<RegistrationResult>>());
    final registration = (result as AuthSuccess<RegistrationResult>).data;
    expect(registration.userId, 'user-1');
    expect(registration.emailVerificationRequired, isTrue);
    verify(() => dio.post(ApiEndpoints.register, data: signupData)).called(1);
  });

  test('signup verification sends email and six digit OTP to backend',
      () async {
    when(() => dio.post(
          ApiEndpoints.signupVerify,
          data: {
            'email': 'new.user@example.com',
            'otp': '654321',
          },
        )).thenAnswer(
      (_) async => _response(ApiEndpoints.signupVerify, {
        'id': 'user-1',
        'email': 'new.user@example.com',
        'full_name': 'New User',
        'role': 'normal_user',
        'is_active': true,
        'status': 'active',
      }),
    );

    final result = await dataSource.verifySignup(
      'new.user@example.com',
      '654321',
    );

    expect(result, isA<AuthSuccess<UserModel>>());
    expect((result as AuthSuccess<UserModel>).data.role, UserRole.normalUser);
    verify(() => dio.post(
          ApiEndpoints.signupVerify,
          data: {
            'email': 'new.user@example.com',
            'otp': '654321',
          },
        )).called(1);
  });

  test('signup never calls legacy phone OTP endpoints', () {
    expect(ApiEndpoints.register, '/auth/signup');
    expect(ApiEndpoints.signupVerify, '/auth/signup/verify');
    expect(ApiEndpoints.register, isNot('/auth/otp/request'));
    expect(ApiEndpoints.signupVerify, isNot('/auth/otp/verify'));
  });
}
