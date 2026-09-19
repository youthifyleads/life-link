import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lifelink_mobile/features/payments/data/payment_remote_datasource.dart';
import 'package:lifelink_mobile/features/payments/data/payment_repository.dart';
import 'package:lifelink_mobile/features/payments/domain/models/payment_model.dart';
import 'package:lifelink_mobile/features/payments/presentation/bloc/payment_cubit.dart';

class _FakePaymentDataSource extends PaymentRemoteDataSource {
  _FakePaymentDataSource() : super(Dio());

  PaymentModel? payment;
  Object? initiateError;
  Object? refreshError;

  @override
  Future<PaymentModel> initiate({
    required String bloodRequestId,
    required String paymentMethod,
  }) async {
    if (initiateError != null) throw initiateError!;
    return payment!;
  }

  @override
  Future<PaymentModel> getById(String paymentId) async {
    if (refreshError != null) throw refreshError!;
    return payment!;
  }
}

PaymentModel _payment({
  String status = 'pending',
  String? checkoutUrl = 'https://paymob.example/checkout',
}) =>
    PaymentModel(
      paymentId: 'payment-1',
      bloodRequestId: 'request-1',
      amount: '500',
      paymentStatus: status,
      paymentMethod: 'card',
      checkoutUrl: checkoutUrl,
    );

void main() {
  late _FakePaymentDataSource dataSource;
  late PaymentCubit cubit;

  setUp(() {
    dataSource = _FakePaymentDataSource()..payment = _payment();
    cubit = PaymentCubit(PaymentRepository(dataSource));
  });

  tearDown(() async {
    await cubit.close();
  });

  test('initiate success clears loading and returns payment', () async {
    final result = await cubit.initiate(
      bloodRequestId: 'request-1',
      paymentMethod: 'card',
    );

    expect(result?.paymentId, 'payment-1');
    expect(cubit.state.loading, isFalse);
    expect(cubit.state.error, isNull);
  });

  test('initiate failure clears loading, stores error, and rethrows', () async {
    dataSource.initiateError = StateError('pricing unavailable');

    await expectLater(
      cubit.initiate(
        bloodRequestId: 'request-1',
        paymentMethod: 'card',
      ),
      throwsA(isA<StateError>()),
    );

    expect(cubit.state.loading, isFalse);
    expect(cubit.state.error, contains('pricing unavailable'));
  });

  test('refresh success clears loading and returns latest payment', () async {
    dataSource.payment = _payment(status: 'paid');

    final result = await cubit.refresh('payment-1');

    expect(result?.paymentStatus, 'paid');
    expect(cubit.state.loading, isFalse);
    expect(cubit.state.error, isNull);
  });

  test('refresh failure clears loading, stores error, and rethrows', () async {
    dataSource.refreshError = StateError('status unavailable');

    await expectLater(
      cubit.refresh('payment-1'),
      throwsA(isA<StateError>()),
    );

    expect(cubit.state.loading, isFalse);
    expect(cubit.state.error, contains('status unavailable'));
  });

  test('checkout unavailable is never considered successful', () {
    expect(_payment(status: 'checkout_unavailable').isSuccessful, isFalse);
    expect(_payment(status: 'checkout_unavailable').isFailed, isTrue);
  });
}
