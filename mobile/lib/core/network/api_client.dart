import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../config/app_config.dart';

/// Central Dio client. A single refresh future serializes concurrent 401s.
class ApiClient {
  static Dio create(FlutterSecureStorage secureStorage) {
    Future<String?>? refreshFuture;
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

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await secureStorage.read(key: AppConfig.accessTokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final request = error.requestOptions;
          final shouldRefresh = error.response?.statusCode == 401 &&
              request.extra['skipTokenRefresh'] != true &&
              !request.path.endsWith('/auth/login') &&
              !request.path.endsWith('/auth/refresh') &&
              !request.path.endsWith('/auth/logout');
          if (!shouldRefresh) {
            handler.next(error);
            return;
          }

          final refreshToken =
              await secureStorage.read(key: AppConfig.refreshTokenKey);
          if (refreshToken == null || refreshToken.isEmpty) {
            await _clearSession(secureStorage);
            handler.next(error);
            return;
          }

          try {
            refreshFuture ??= _refreshAccessToken(
              dio,
              secureStorage,
              refreshToken,
            );
            final accessToken = await refreshFuture;
            refreshFuture = null;
            if (accessToken == null || accessToken.isEmpty) {
              throw StateError(
                  'Refresh response did not include an access token.');
            }
            request.headers['Authorization'] = 'Bearer $accessToken';
            handler.resolve(await dio.fetch(request));
          } catch (_) {
            refreshFuture = null;
            await _clearSession(secureStorage);
            handler.next(error);
          }
        },
      ),
    );

    if (AppConfig.isDev) {
      dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: false,
          requestBody: true,
          responseBody: true,
          error: true,
          compact: true,
        ),
      );
    }
    return dio;
  }

  static Future<String?> _refreshAccessToken(
    Dio dio,
    FlutterSecureStorage secureStorage,
    String refreshToken,
  ) async {
    final response = await dio.post(
      '/auth/refresh',
      data: {'refresh_token': refreshToken},
      options: Options(extra: {'skipTokenRefresh': true}),
    );
    final data = response.data;
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Invalid refresh response.');
    }
    final accessToken = data['access_token'];
    if (accessToken is! String || accessToken.isEmpty) {
      throw const FormatException('Invalid access token in refresh response.');
    }
    await secureStorage.write(
      key: AppConfig.accessTokenKey,
      value: accessToken,
    );
    final rotated = data['refresh_token'];
    if (rotated is String && rotated.isNotEmpty) {
      await secureStorage.write(
        key: AppConfig.refreshTokenKey,
        value: rotated,
      );
    }
    return accessToken;
  }

  static Future<void> _clearSession(
    FlutterSecureStorage secureStorage,
  ) async {
    await secureStorage.delete(key: AppConfig.accessTokenKey);
    await secureStorage.delete(key: AppConfig.refreshTokenKey);
    await secureStorage.delete(key: AppConfig.userKey);
  }
}
