import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../config/app_config.dart';

/// Central Dio HTTP client with JWT Bearer auth interceptor.
/// - Automatically attaches Authorization header to every request.
/// - Handles 401 session expiry by clearing token and signaling re-login.
class ApiClient {
  static Dio create(FlutterSecureStorage secureStorage) {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        sendTimeout: AppConfig.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // JWT Bearer token interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await secureStorage.read(key: AppConfig.accessTokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // 401 — token expired or invalid: clear session
          if (error.response?.statusCode == 401) {
            await secureStorage.delete(key: AppConfig.accessTokenKey);
            await secureStorage.delete(key: AppConfig.refreshTokenKey);
            await secureStorage.delete(key: AppConfig.userKey);
          }
          return handler.next(error);
        },
      ),
    );

    // Pretty logger (dev only — never log tokens in production)
    if (AppConfig.isDev) {
      dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: false, // never log Authorization header
          requestBody: true,
          responseBody: true,
          error: true,
          compact: true,
        ),
      );
    }

    return dio;
  }
}
