import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/donor_repository.dart';

class DonorConsentState {
  const DonorConsentState({
    this.loading = false,
    this.error,
    this.consents = const [],
  });

  final bool loading;
  final String? error;
  final List<Map<String, dynamic>> consents;

  DonorConsentState copyWith({
    bool? loading,
    String? error,
    List<Map<String, dynamic>>? consents,
  }) {
    return DonorConsentState(
      loading: loading ?? this.loading,
      error: error,
      consents: consents ?? this.consents,
    );
  }
}

class DonorConsentCubit extends Cubit<DonorConsentState> {
  DonorConsentCubit(this._repository) : super(const DonorConsentState());

  final DonorRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final consents = await _repository.getConsents();
      emit(state.copyWith(loading: false, consents: consents));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}
