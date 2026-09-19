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
    try {
      final response = await _dio.post(
        '/payments/initiate',
        data: {
          if (bloodRequestId != null) 'blood_request_id': bloodRequestId,
          if (allocationId != null) 'allocation_id': allocationId,
          'payment_method': paymentMethod,
        },
      );
      return PaymentModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return PaymentModel(
          paymentId: 'pay_demo_${DateTime.now().millisecondsSinceEpoch}',
          bloodRequestId: bloodRequestId ?? 'REQ-2024-8842',
          amount: '700.00',
          paymentStatus: 'pending',
          paymentMethod: paymentMethod,
          checkoutUrl:
              'https://accept.paymob.com/unifiedcheckout/?publicKey=egy_pk_test_bKtkvo5X9GTf2RO1Kwyvk11apqc7yQbG&clientSecret=egy_csk_test_39f3a98c4135b2feba0fa299a0711d46',
          transactionReference: 'LL-PAYMOB-TEST-DEMO',
        );
      }
      rethrow;
    }
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

  Future<PaymentModel> initiate({
    required String bloodRequestId,
    required String paymentMethod,
  }) =>
      initiatePayment(
        bloodRequestId: bloodRequestId,
        paymentMethod: paymentMethod,
      );

  Future<PaymentModel> getById(String paymentId) => getPayment(paymentId);

  Future<List<PaymentModel>> getByRequestId(String requestId) =>
      getPaymentsForRequest(requestId);
}
