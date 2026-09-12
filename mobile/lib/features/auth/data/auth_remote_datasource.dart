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

class RegistrationResult {
  final UserModel user;
  final String challengeId;
  final int expiresInSeconds;
  final String? debugOtp;

  RegistrationResult({
    required this.user,
    required this.challengeId,
    required this.expiresInSeconds,
    this.debugOtp,
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
      final token = response.data['access_token'] as String;
      return AuthSuccess(token);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// POST /api/v1/auth/otp/request
  Future<AuthResult<Map<String, dynamic>>> requestOtp(
    String phone, {
    String purpose = 'login',
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.otpRequest,
        data: {'phone': phone, 'purpose': purpose},
      );
      return AuthSuccess(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// POST /api/v1/auth/otp/verify
  Future<AuthResult<String>> verifyOtp(String challengeId, String otp) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.otpVerify,
        data: {'challenge_id': challengeId, 'code': otp},
      );
      final token = response.data['access_token'] as String;
      return AuthSuccess(token);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// POST /api/v1/auth/register
  Future<AuthResult<RegistrationResult>> registerUser({
    required String email,
    required String fullName,
    required String password,
    required String role,
    required String phone,
    String? bloodType,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.register,
        data: {
          'email': email,
          'full_name': fullName,
          'password': password,
          'role': role,
          'phone': phone,
          if (bloodType != null) 'blood_type': bloodType,
        },
      );
      final body = response.data as Map<String, dynamic>;
      return AuthSuccess(RegistrationResult(
        user: UserModel.fromJson(body['user'] as Map<String, dynamic>),
        challengeId: body['challenge_id'] as String,
        expiresInSeconds: body['expires_in_seconds'] as int,
        debugOtp: body['debug_otp'] as String?,
      ));
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

  Future<void> persistSession(String token, UserModel user) async {
    await _storage.write(key: AppConfig.accessTokenKey, value: token);
    await _storage.write(
        key: AppConfig.userKey, value: jsonEncode(user.toJson()));
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
          if (code == 'PHONE_NOT_FOUND') return 'رقم الهاتف غير مسجل بالنظام';
          if (code == 'INVALID_OTP') {
            return 'رمز التحقق (OTP) غير صحيح أو انتهت صلاحيته';
          }
          if (code == 'OTP_RATE_LIMITED' || code == 'RATE_LIMITED') {
            return 'تم طلب رموز تحقق كثيرة. انتظر قليلًا ثم حاول مرة أخرى';
          }
          if (code == 'OTP_EXPIRED') {
            return 'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا';
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
