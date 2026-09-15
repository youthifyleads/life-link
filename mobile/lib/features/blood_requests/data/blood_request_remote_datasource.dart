import 'package:dio/dio.dart';

import '../domain/models/blood_request_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class BloodRequestRemoteDataSource {
  final Dio _dio;

  BloodRequestRemoteDataSource(this._dio);

  /// POST /api/v1/requests
  Future<BloodRequestPublic> createRequest(
      BloodRequestCreate requestData) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.requests,
        data: requestData.toJson(),
      );
      return BloodRequestPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 403) {
        throw 'تنبيه الصلاحية: بحسب معايير الباك إند الحالية (Hospital User only)، يتطلب إنشاء الطلب ترخيص مستشفى أو تفعيل صلاحية Caregiver.';
      }
      if (e.response?.statusCode == 401) {
        throw 'يرجى تسجيل الدخول وإدخال رمز OTP أولاً لتنفيذ هذه العملية.';
      }
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/requests
  Future<List<BloodRequestPublic>> getRequests() async {
    try {
      final response = await _dio.get(ApiEndpoints.requests);
      final List data = response.data as List;
      return data
          .map((json) =>
              BloodRequestPublic.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/requests/{id}
  Future<BloodRequestPublic> getRequestById(String id) async {
    try {
      final response = await _dio.get(ApiEndpoints.requestById(id));
      return BloodRequestPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/donors/me/responses
  Future<void> respondToRequest(String requestId,
      {String status = 'accepted', String notes = ''}) async {
    try {
      await _dio.post(
        ApiEndpoints.donorResponses,
        data: {
          'blood_request_id': requestId,
          'status': status,
          'notes': notes,
        },
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw 'يرجى تسجيل الدخول كمتبرع معتمد للاستجابة لهذا الطلب.';
      }
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/requests/{id}/cancel
  Future<void> cancelRequest(String requestId) async {
    try {
      await _dio.post(ApiEndpoints.cancelRequest(requestId));
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/requests/{id}/qr
  Future<Map<String, dynamic>> issueQr(String requestId) async {
    try {
      final response = await _dio.post(ApiEndpoints.issueQr(requestId));
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}
