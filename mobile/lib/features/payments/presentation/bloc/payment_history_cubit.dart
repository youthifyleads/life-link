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
