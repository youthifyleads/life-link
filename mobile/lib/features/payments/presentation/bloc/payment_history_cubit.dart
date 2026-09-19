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
    }
  }
}
