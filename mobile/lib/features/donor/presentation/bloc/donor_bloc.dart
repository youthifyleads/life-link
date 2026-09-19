import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/donor_profile_model.dart';
import '../../data/donor_remote_datasource.dart';
import '../../../../core/network/api_error_message.dart';

// ── Events ────────────────────────────────────────────────
abstract class DonorEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadDonorProfileEvent extends DonorEvent {}

// ── States ────────────────────────────────────────────────
abstract class DonorState extends Equatable {
  @override
  List<Object?> get props => [];
}

class DonorInitial extends DonorState {}

class DonorLoading extends DonorState {}

class DonorLoaded extends DonorState {
  final DonorProfileModel profile;
  final List<DonationHistoryItem> history;

  DonorLoaded({required this.profile, required this.history});

  @override
  List<Object?> get props => [profile, history];
}

class DonorError extends DonorState {
  final String message;
  DonorError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────
class DonorBloc extends Bloc<DonorEvent, DonorState> {
  final DonorRemoteDataSource _dataSource;

  DonorBloc(this._dataSource) : super(DonorInitial()) {
    on<LoadDonorProfileEvent>(_onLoadProfile);
  }

  Future<void> _onLoadProfile(
    LoadDonorProfileEvent event,
    Emitter<DonorState> emit,
  ) async {
    emit(DonorLoading());
    try {
      final profile = await _dataSource.getProfile();
      final history = await _dataSource.getDonationHistory();
      emit(DonorLoaded(profile: profile, history: history));
    } catch (e) {
      emit(DonorError(friendlyErrorMessage(e)));
    }
  }
}
