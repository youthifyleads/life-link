import 'package:dio/dio.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../domain/models/blood_bag_models.dart';

class BloodBagRemoteDataSource {
  BloodBagRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<BloodBagModel>> list() async {
    final response = await _dio.get(ApiEndpoints.bloodBags);
    final data = response.data as List;
    return data
        .map((item) => BloodBagModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<BloodBagScanResult> scan(String qrCode) async {
    final response = await _dio.post(
      ApiEndpoints.bloodBagScan,
      data: {'qr_code': qrCode},
    );
    return BloodBagScanResult.fromJson(response.data as Map<String, dynamic>);
  }

  Future<BloodBagQrModel> getQr(String id) async {
    final response = await _dio.get(ApiEndpoints.bloodBagQr(id));
    return BloodBagQrModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> updateStatus(String id, BloodBagStatusUpdate update) async {
    await _dio.patch(
      ApiEndpoints.bloodBagStatus(id),
      data: update.toJson(),
    );
  }

  Future<List<Map<String, dynamic>>> history(String id) async {
    final response = await _dio.get(ApiEndpoints.bloodBagHistory(id));
    return (response.data as List)
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
  }
}
