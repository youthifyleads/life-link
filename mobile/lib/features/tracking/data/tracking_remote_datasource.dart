import 'package:dio/dio.dart';

import '../domain/models/tracking_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class TrackingRemoteDataSource {
  final Dio _dio;

  TrackingRemoteDataSource(this._dio);

  /// POST /api/v1/qr/scan
  Future<TrackingPublic> scanQr(String reference) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.qrScan,
        data: {'reference': reference},
      );
      return TrackingPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/tracking/{reference}
  Future<TrackingPublic> getTrackingInfo(String reference) async {
    try {
      final response = await _dio.get(ApiEndpoints.tracking(reference));
      return TrackingPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}
