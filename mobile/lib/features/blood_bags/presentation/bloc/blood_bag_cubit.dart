import 'package:bloc/bloc.dart';

import '../../data/blood_bag_repository.dart';
import '../../domain/models/blood_bag_models.dart';

class BloodBagState {
  const BloodBagState({
    this.loading = false,
    this.bags = const [],
    this.error,
  });

  final bool loading;
  final List<BloodBagModel> bags;
  final String? error;

  BloodBagState copyWith(
      {bool? loading, List<BloodBagModel>? bags, String? error}) {
    return BloodBagState(
      loading: loading ?? this.loading,
      bags: bags ?? this.bags,
      error: error,
    );
  }
}

class BloodBagCubit extends Cubit<BloodBagState> {
  BloodBagCubit(this._repository) : super(const BloodBagState());

  final BloodBagRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final bags = await _repository.list();
      emit(state.copyWith(loading: false, bags: bags));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}
