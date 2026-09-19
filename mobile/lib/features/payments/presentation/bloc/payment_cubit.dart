import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../data/payment_repository.dart';
import '../../domain/models/payment_model.dart';

class PaymentState extends Equatable {
  const PaymentState({
    this.payment,
    this.loading = false,
    this.error,
  });

  final PaymentModel? payment;
  final bool loading;
  final String? error;

  PaymentState copyWith({PaymentModel? payment, bool? loading, String? error}) {
    return PaymentState(
      payment: payment ?? this.payment,
      loading: loading ?? this.loading,
      error: error,
    );
  }

  @override
  List<Object?> get props => [payment, loading, error];
}

class PaymentCubit extends Cubit<PaymentState> {
  PaymentCubit(this._repository) : super(const PaymentState());

  final PaymentRepository _repository;

  Future<PaymentModel?> initiate({
    required String? bloodRequestId,
    String? allocationId,
    required String paymentMethod,
  }) async {
    if (bloodRequestId == null || bloodRequestId.isEmpty) {
      emit(state.copyWith(
          loading: false, error: 'A blood request is required.'));
      return null;
    }

    emit(state.copyWith(loading: true, error: null));
    try {
      final payment = await _repository.initiate(
        bloodRequestId: bloodRequestId,
        paymentMethod: paymentMethod,
      );
      emit(state.copyWith(loading: false, payment: payment, error: null));
      return payment;
    } catch (error, stackTrace) {
      emit(state.copyWith(loading: false, error: error.toString()));
      Error.throwWithStackTrace(error, stackTrace);
    }
  }

  Future<PaymentModel?> refresh(String paymentId) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final payment = await _repository.getById(paymentId);
      emit(state.copyWith(loading: false, payment: payment, error: null));
      return payment;
    } catch (error, stackTrace) {
      emit(state.copyWith(loading: false, error: error.toString()));
      Error.throwWithStackTrace(error, stackTrace);
    }
  }
}
