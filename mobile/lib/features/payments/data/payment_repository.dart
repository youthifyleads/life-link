import '../domain/models/payment_model.dart';
import 'payment_remote_datasource.dart';

class PaymentRepository {
  PaymentRepository(this._dataSource);

  final PaymentRemoteDataSource _dataSource;

  Future<PaymentModel> initiate({
    required String bloodRequestId,
    required String paymentMethod,
  }) =>
      _dataSource.initiate(
        bloodRequestId: bloodRequestId,
        paymentMethod: paymentMethod,
      );

  Future<PaymentModel> getById(String paymentId) =>
      _dataSource.getById(paymentId);

  Future<List<PaymentModel>> getByRequestId(String requestId) =>
      _dataSource.getByRequestId(requestId);

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
}
