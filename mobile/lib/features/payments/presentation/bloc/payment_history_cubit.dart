import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../data/payment_repository.dart';
import '../../domain/models/payment_model.dart';

class PaymentHistoryState extends Equatable {
  const PaymentHistoryState({
    this.loading = false,
    this.payments = const [],
    this.error,
  });

  final bool loading;
  final List<PaymentModel> payments;
  final String? error;

  PaymentHistoryState copyWith(
      {bool? loading, List<PaymentModel>? payments, String? error}) {
    return PaymentHistoryState(
      loading: loading ?? this.loading,
      payments: payments ?? this.payments,
      error: error,
    );
  }

  @override
  List<Object?> get props => [loading, payments, error];
}

class PaymentHistoryCubit extends Cubit<PaymentHistoryState> {
  PaymentHistoryCubit(this._repository) : super(const PaymentHistoryState());

  final PaymentRepository _repository;

  Future<void> load(String requestId) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final payments = await _repository.getByRequestId(requestId);
      emit(state.copyWith(loading: false, payments: payments));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/payment_repository.dart';
import '../../domain/models/payment_model.dart';
import '../../../../core/network/api_error_message.dart';

class PaymentHistoryState {
  final bool loading;
  final String? error;
  final List<PaymentModel> payments;

  const PaymentHistoryState({
    this.loading = false,
    this.error,
    this.payments = const [],
  });

  PaymentHistoryState copyWith({
    bool? loading,
    String? error,
    List<PaymentModel>? payments,
  }) {
    return PaymentHistoryState(
      loading: loading ?? this.loading,
      error: error,
      payments: payments ?? this.payments,
    );
  }
}

class PaymentHistoryCubit extends Cubit<PaymentHistoryState> {
  final PaymentRepository _repository;

  PaymentHistoryCubit(this._repository) : super(const PaymentHistoryState());

  Future<void> load(String requestId) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final list = await _repository.getPaymentsForRequest(requestId);
      emit(state.copyWith(loading: false, payments: list));
    } catch (e) {
      emit(state.copyWith(loading: false, error: friendlyErrorMessage(e)));
    }
  }
}
