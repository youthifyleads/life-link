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
}
