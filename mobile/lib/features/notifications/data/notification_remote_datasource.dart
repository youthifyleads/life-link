import 'package:dio/dio.dart';

import '../domain/models/notification_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class NotificationRemoteDataSource {
  final Dio _dio;

  NotificationRemoteDataSource(this._dio);

  /// GET /api/v1/notifications
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await _dio.get(ApiEndpoints.notifications);
      final List data = response.data as List;
      return data
          .map((json) =>
              NotificationModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/notifications/{id}/read
  Future<NotificationModel> markAsRead(String notificationId) async {
    try {
      final response =
          await _dio.post(ApiEndpoints.markNotificationRead(notificationId));
      return NotificationModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}
