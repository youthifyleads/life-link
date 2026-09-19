import '../domain/models/payment_model.dart';
import 'payment_remote_datasource.dart';

class PaymentRepository {
  final PaymentRemoteDataSource _remoteDataSource;

  PaymentRepository(this._remoteDataSource);

  Future<PaymentModel> initiatePayment({
    String? bloodRequestId,
    String? allocationId,
    required String paymentMethod,
  }) {
    return _remoteDataSource.initiatePayment(
      bloodRequestId: bloodRequestId,
      allocationId: allocationId,
      paymentMethod: paymentMethod,
    );
  }

  Future<PaymentModel> getPayment(String paymentId) {
    return _remoteDataSource.getPayment(paymentId);
  }

  Future<List<PaymentModel>> getPaymentsForRequest(String bloodRequestId) {
    return _remoteDataSource.getPaymentsForRequest(bloodRequestId);
  }

  Future<PaymentModel> initiate({
    required String bloodRequestId,
    required String paymentMethod,
  }) =>
      _remoteDataSource.initiate(
        bloodRequestId: bloodRequestId,
        paymentMethod: paymentMethod,
      );

  Future<PaymentModel> getById(String paymentId) =>
      _remoteDataSource.getById(paymentId);

  Future<List<PaymentModel>> getByRequestId(String requestId) =>
      _remoteDataSource.getByRequestId(requestId);
}
