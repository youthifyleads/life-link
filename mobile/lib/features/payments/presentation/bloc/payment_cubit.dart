import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/payment_repository.dart';
import '../../domain/models/payment_model.dart';
import '../../../../core/network/api_error_message.dart';

class PaymentState {
  final bool loading;
  final String? error;
  final PaymentModel? payment;

  const PaymentState({
    this.loading = false,
    this.error,
    this.payment,
  });

  PaymentState copyWith({
    bool? loading,
    String? error,
    PaymentModel? payment,
  }) {
    return PaymentState(
      loading: loading ?? this.loading,
      error: error,
      payment: payment ?? this.payment,
    );
  }
}

class PaymentCubit extends Cubit<PaymentState> {
  final PaymentRepository _repository;

  PaymentCubit(this._repository) : super(const PaymentState());

  Future<PaymentModel?> initiate({
    String? bloodRequestId,
    String? allocationId,
    required String paymentMethod,
  }) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final payment = await _repository.initiatePayment(
        bloodRequestId: bloodRequestId,
        allocationId: allocationId,
        paymentMethod: paymentMethod,
      );
      emit(state.copyWith(loading: false, payment: payment));
      return payment;
    } catch (e) {
      emit(state.copyWith(loading: false, error: friendlyErrorMessage(e)));
      return null;
    }
  }

  Future<PaymentModel?> refresh(String paymentId) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final payment = await _repository.getPayment(paymentId);
      emit(state.copyWith(loading: false, payment: payment));
      return payment;
    } catch (e) {
      emit(state.copyWith(loading: false, error: friendlyErrorMessage(e)));
      return null;
    }
  }
}
