import 'package:dio/dio.dart';
import '../domain/models/payment_model.dart';

class PaymentRemoteDataSource {
  final Dio _dio;

  PaymentRemoteDataSource(this._dio);

  Future<PaymentModel> initiatePayment({
    String? bloodRequestId,
    String? allocationId,
    required String paymentMethod,
  }) async {
    final response = await _dio.post(
      '/payments/initiate',
      data: {
        if (bloodRequestId != null) 'blood_request_id': bloodRequestId,
        if (allocationId != null) 'allocation_id': allocationId,
        'payment_method': paymentMethod,
      },
    );
    return PaymentModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<PaymentModel> getPayment(String paymentId) async {
    final response = await _dio.get('/payments/$paymentId');
    return PaymentModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<PaymentModel>> getPaymentsForRequest(String bloodRequestId) async {
    final response = await _dio.get(
      '/payments',
      queryParameters: {'blood_request_id': bloodRequestId},
    );
    final list = response.data as List<dynamic>;
    return list
        .map((item) => PaymentModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
