import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../domain/models/user_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/config/app_config.dart';

sealed class AuthResult<T> {}

class AuthSuccess<T> extends AuthResult<T> {
  final T data;
  AuthSuccess(this.data);
}

class AuthFailure<T> extends AuthResult<T> {
  final String message;
  final int? statusCode;
  AuthFailure(this.message, {this.statusCode});
}

class AuthTokens {
  final String accessToken;
  final String? refreshToken;

  AuthTokens({required this.accessToken, this.refreshToken});

  factory AuthTokens.fromJson(Map<String, dynamic> json) => AuthTokens(
        accessToken: json['access_token'] as String,
        refreshToken: json['refresh_token'] as String?,
      );
}

class RegistrationResult {
  final UserModel? user;
  final String? challengeId;
  final int? expiresInSeconds;

  RegistrationResult({
    this.user,
    this.challengeId,
    this.expiresInSeconds,
  });
}

class AuthRemoteDataSource {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthRemoteDataSource(this._dio, this._storage);

  /// POST /api/v1/auth/login
  Future<AuthResult<String>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      final tokens = AuthTokens.fromJson(response.data as Map<String, dynamic>);
      await persistTokens(tokens);
      return AuthSuccess(tokens.accessToken);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// The deployed API exposes a legacy phone-based generic OTP endpoint.
  /// LifeLink mobile deliberately does not call it; signup verification is
  /// email-based through /auth/signup/verify.
  Future<AuthResult<Map<String, dynamic>>> requestOtp(
    String email, {
    String purpose = 'login',
  }) async {
    return AuthFailure(
      'تسجيل الدخول برمز OTP غير متاح في عقدة الخادم الحالية. استخدم البريد وكلمة المرور.',
    );
  }

  /// Generic login OTP is not part of the deployed email-only mobile flow.
  Future<AuthResult<String>> verifyOtp(String challengeId, String otp) async {
    return AuthFailure(
      'تسجيل الدخول برمز OTP غير متاح في عقدة الخادم الحالية. استخدم البريد وكلمة المرور.',
    );
  }

  /// POST /api/v1/auth/register
  Future<AuthResult<RegistrationResult>> registerUser({
    required String email,
    required String name,
    required String phone,
    required String dateOfBirth,
    required String password,
    String? bloodType,
    String? governorate,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.register,
        data: {
          'email': email,
          'name': name,
          'phone': phone,
          'date_of_birth': dateOfBirth,
          'password': password,
          if (bloodType != null) 'blood_type': bloodType,
          if (governorate != null) 'governorate': governorate,
        },
      );
      final body = response.data as Map<String, dynamic>;
      return AuthSuccess(RegistrationResult(
        user: body['user'] is Map<String, dynamic>
            ? UserModel.fromJson(body['user'] as Map<String, dynamic>)
            : null,
        challengeId: body['challenge_id'] as String?,
      ));
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResult<UserModel>> verifySignup(String email, String otp) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.signupVerify,
        data: {'email': email, 'otp': otp},
      );
      return AuthSuccess(
          UserModel.fromJson(response.data as Map<String, dynamic>));
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResult<Map<String, dynamic>>> resendSignupOtp(String email) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.signupResendOtp,
        data: {'email': email},
      );
      return AuthSuccess(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// GET /api/v1/auth/me
  Future<AuthResult<UserModel>> getMe() async {
    try {
      final response = await _dio.get(ApiEndpoints.me);
      return AuthSuccess(
          UserModel.fromJson(response.data as Map<String, dynamic>));
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// POST /api/v1/auth/forgot-password
  Future<AuthResult<String>> forgotPassword(String email) async {
    try {
      await _dio.post(
        ApiEndpoints.forgotPassword,
        data: {'email': email},
      );
      return AuthSuccess(
          'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني');
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// POST /api/v1/auth/reset-password
  Future<AuthResult<String>> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    try {
      await _dio.post(
        ApiEndpoints.resetPassword,
        data: {
          'email': email,
          'code': code,
          'new_password': newPassword,
        },
      );
      return AuthSuccess(
          'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResult<UserModel>> updateProfile({
    String? fullName,
    String? email,
    String? phone,
  }) async {
    try {
      final response = await _dio.patch(
        ApiEndpoints.myUserProfile,
        data: {
          if (fullName != null) 'full_name': fullName,
          if (email != null) 'email': email,
          if (phone != null) 'phone': phone,
        },
      );
      return AuthSuccess(
          UserModel.fromJson(response.data as Map<String, dynamic>));
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: AppConfig.accessTokenKey, value: token);
  }

  Future<void> persistSession(
    String token,
    UserModel user, {
    String? refreshToken,
  }) async {
    await saveToken(token);
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await _storage.write(
        key: AppConfig.refreshTokenKey,
        value: refreshToken,
      );
    }
    await _storage.write(
        key: AppConfig.userKey, value: jsonEncode(user.toJson()));
  }

  Future<AuthResult<AuthTokens>> refreshSession() async {
    final refreshToken = await _storage.read(key: AppConfig.refreshTokenKey);
    if (refreshToken == null || refreshToken.isEmpty) {
      return AuthFailure('انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى');
    }
    try {
      final response = await _dio.post(
        ApiEndpoints.refresh,
        data: {'refresh_token': refreshToken},
        options: Options(extra: {'skipTokenRefresh': true}),
      );
      final tokens = AuthTokens.fromJson(response.data as Map<String, dynamic>);
      await persistTokens(tokens);
      return AuthSuccess(tokens);
    } on DioException catch (e) {
      await clearSession();
      return _handleDioError(e);
    }
  }

  Future<void> persistTokens(AuthTokens tokens) async {
    await _storage.write(
        key: AppConfig.accessTokenKey, value: tokens.accessToken);
    if (tokens.refreshToken != null && tokens.refreshToken!.isNotEmpty) {
      await _storage.write(
          key: AppConfig.refreshTokenKey, value: tokens.refreshToken);
    } else {
      await _storage.delete(key: AppConfig.refreshTokenKey);
    }
  }

  Future<void> logout() async {
    final refreshToken = await _storage.read(key: AppConfig.refreshTokenKey);
    try {
      await _dio.post(
        ApiEndpoints.logout,
        data: {'refresh_token': refreshToken},
        options: Options(extra: {'skipTokenRefresh': true}),
      );
    } on DioException {
      // Local cleanup must still happen when the server is unavailable.
    } finally {
      await clearSession();
    }
  }

  Future<String?> getStoredToken() =>
      _storage.read(key: AppConfig.accessTokenKey);

  Future<UserModel?> getStoredUser() async {
    final raw = await _storage.read(key: AppConfig.userKey);
    if (raw == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearSession() async {
    await _storage.delete(key: AppConfig.accessTokenKey);
    await _storage.delete(key: AppConfig.refreshTokenKey);
    await _storage.delete(key: AppConfig.userKey);
  }

  AuthFailure<T> _handleDioError<T>(DioException e) {
    final statusCode = e.response?.statusCode;
    return AuthFailure(_extractMessage(e), statusCode: statusCode);
  }

  String _extractMessage(DioException e) {
    try {
      final body = e.response?.data;
      if (body is Map) {
        if (body['error'] is Map) {
          final errorMap = body['error'] as Map;
          final msg = errorMap['message']?.toString();
          final code = errorMap['code']?.toString();
          if (code == 'INVALID_CREDENTIALS') {
            return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          }
          if (code == 'EMAIL_NOT_FOUND') {
            return 'البريد الإلكتروني غير مسجل بالنظام';
          }
          if (code == 'INVALID_OTP') {
            return 'رمز التحقق (OTP) غير صحيح أو انتهت صلاحيته';
          }
          if (code == 'OTP_RATE_LIMITED' || code == 'RATE_LIMITED') {
            return 'تم طلب رموز تحقق كثيرة. انتظر قليلًا ثم حاول مرة أخرى';
          }
          if (code == 'OTP_EXPIRED') {
            return 'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا';
          }
          if (code == 'OTP_ATTEMPTS_EXCEEDED') {
            return 'تم تجاوز عدد محاولات رمز التحقق';
          }
          if (code == 'OTP_NOT_REQUESTED') {
            return 'اطلب رمز التحقق أولًا قبل محاولة التحقق';
          }
          if (code == 'EMAIL_EXISTS' || code == 'EMAIL_ALREADY_EXISTS') {
            return 'البريد الإلكتروني مسجل بالفعل';
          }
          if (code == 'MISSING_BEARER_TOKEN' ||
              code == 'UNAUTHORIZED' ||
              code == 'NOT_AUTHENTICATED') {
            return 'جلسة العمل انتهت أو غير مسجل الدخول، يرجى تسجيل الدخول أولاً';
          }
          if (code == 'FORBIDDEN_ROLE') {
            return 'ليس لديك صلاحية لتنفيذ هذا الإجراء';
          }
          return msg ?? code ?? 'فشل الطلب من الخادم';
        }
        if (body['detail'] is List) {
          final first = (body['detail'] as List).firstOrNull;
          if (first is Map && first['msg'] != null) {
            return 'خطأ في التحقق: ${first['msg']}';
          }
        }
        final detailStr =
            body['detail']?.toString() ?? body['message']?.toString();
        if (detailStr != null &&
            (detailStr.contains('Not authenticated') ||
                detailStr.contains('Bearer'))) {
          return 'يرجى تسجيل الدخول أولاً بالبريد ورمز OTP للمتابعة';
        }
        return detailStr ?? 'فشل الطلب من الخادم';
      }
    } catch (_) {}
    final statusCode = e.response?.statusCode;
    if (statusCode != null) {
      switch (statusCode) {
        case 401:
          return 'انتهت جلسة العمل أو بيانات الدخول غير صحيحة';
        case 403:
          return 'ليس لديك صلاحية لتنفيذ هذا الإجراء';
        case 404:
          return 'المورد المطلوب غير موجود';
        case 422:
          return 'يرجى التحقق من البيانات المدخلة';
        case 429:
          return 'تم طلب رموز تحقق كثيرة. انتظر قليلًا ثم حاول مرة أخرى';
        case >= 500:
          return 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً';
      }
    }
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
      case DioExceptionType.connectionError:
        return 'تعذر الوصول إلى الخادم. تحقق من اتصال الشبكة أو حاول لاحقاً.';
      default:
        return 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.';
    }
  }
}
