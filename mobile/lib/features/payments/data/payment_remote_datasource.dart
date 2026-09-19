import 'package:dio/dio.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../domain/models/payment_model.dart';

class PaymentRemoteDataSource {
  PaymentRemoteDataSource(this._dio);

  final Dio _dio;

  Future<PaymentModel> initiate({
    required String bloodRequestId,
    required String paymentMethod,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.initiatePayment,
      data: {
        'blood_request_id': bloodRequestId,
        'payment_method': paymentMethod,
      },
    );

    return PaymentModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<PaymentModel> getById(String paymentId) async {
    final response = await _dio.get(ApiEndpoints.paymentById(paymentId));
    return PaymentModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<PaymentModel>> getByRequestId(String requestId) async {
    final response =
        await _dio.get(ApiEndpoints.paymentsByRequestId(requestId));
    final data = response.data as List;
    return data
        .map((item) => PaymentModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
