import 'package:bloc/bloc.dart';

import '../../data/donor_repository.dart';

class DonorResponseState {
  const DonorResponseState({
    this.loading = false,
    this.error,
    this.responses = const [],
  });

  final bool loading;
  final String? error;
  final List<Map<String, dynamic>> responses;

  DonorResponseState copyWith({
    bool? loading,
    String? error,
    List<Map<String, dynamic>>? responses,
  }) {
    return DonorResponseState(
      loading: loading ?? this.loading,
      error: error,
      responses: responses ?? this.responses,
    );
  }
}

class DonorResponseCubit extends Cubit<DonorResponseState> {
  DonorResponseCubit(this._repository) : super(const DonorResponseState());

  final DonorRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final responses = await _repository.getResponses();
      emit(state.copyWith(loading: false, responses: responses));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}
