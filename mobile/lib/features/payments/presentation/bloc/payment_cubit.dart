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
      final payment = await _repository.getById(paymentId);
      emit(state.copyWith(loading: false, payment: payment, error: null));
      return payment;
    } catch (error, stackTrace) {
      emit(state.copyWith(loading: false, error: error.toString()));
      Error.throwWithStackTrace(error, stackTrace);

      final payment = await _repository.getPayment(paymentId);
      emit(state.copyWith(loading: false, payment: payment));
      return payment;
    } catch (e) {
      emit(state.copyWith(loading: false, error: friendlyErrorMessage(e)));
      return null;
    }
  }
}
