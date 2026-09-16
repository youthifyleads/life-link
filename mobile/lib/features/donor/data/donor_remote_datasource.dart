import 'package:dio/dio.dart';

import '../domain/models/donor_profile_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class DonorRemoteDataSource {
  final Dio _dio;

  DonorRemoteDataSource(this._dio);

  /// GET /api/v1/donors/me
  Future<DonorProfileModel> getProfile() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorsMe);
      return DonorProfileModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  Future<DonorProfileModel> updateAvailability(bool available) async {
    try {
      final response = await _dio.patch(
        ApiEndpoints.donorsMe,
        data: {'available': available},
      );
      return DonorProfileModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/donors/me/donations
  Future<List<DonationHistoryItem>> getDonationHistory() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorDonations);
      final List data = response.data as List;
      return data
          .map((item) =>
              DonationHistoryItem.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/donors/me/responses
  Future<void> respondToRequest(String requestId, String status,
      {String notes = ''}) async {
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
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/donors/me/consents
  Future<void> submitConsent(String consentType, bool granted) async {
    try {
      await _dio.post(
        ApiEndpoints.donorConsents,
        data: {
          'consent_type': consentType,
          'granted': granted,
        },
      );
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/donors/me/consents
  Future<List<Map<String, dynamic>>> getConsents() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorConsents);
      final List data = response.data as List;
      return data.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}
