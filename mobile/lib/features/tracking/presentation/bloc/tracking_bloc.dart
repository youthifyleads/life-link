import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/tracking_model.dart';
import '../../data/tracking_remote_datasource.dart';

// ── Events ────────────────────────────────────────────────
abstract class TrackingEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class ScanQrEvent extends TrackingEvent {
  final String reference;
  ScanQrEvent(this.reference);
  @override
  List<Object?> get props => [reference];
}

class LookupReferenceEvent extends TrackingEvent {
  final String reference;
  LookupReferenceEvent(this.reference);
  @override
  List<Object?> get props => [reference];
}

class ResetTrackingEvent extends TrackingEvent {}

// ── States ────────────────────────────────────────────────
abstract class TrackingState extends Equatable {
  @override
  List<Object?> get props => [];
}

class TrackingInitial extends TrackingState {}

class TrackingScanning extends TrackingState {}

class TrackingLoading extends TrackingState {
  final String reference;
  TrackingLoading(this.reference);
  @override
  List<Object?> get props => [reference];
}

class TrackingLoaded extends TrackingState {
  final TrackingPublic tracking;
  TrackingLoaded(this.tracking);
  @override
  List<Object?> get props => [tracking];
}

class TrackingError extends TrackingState {
  final String message;
  TrackingError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────
class TrackingBloc extends Bloc<TrackingEvent, TrackingState> {
  final TrackingRemoteDataSource _dataSource;

  TrackingBloc(this._dataSource) : super(TrackingInitial()) {
    on<ScanQrEvent>(_onScanQr);
    on<LookupReferenceEvent>(_onLookupReference);
    on<ResetTrackingEvent>((_, emit) => emit(TrackingInitial()));
  }

  Future<void> _onScanQr(ScanQrEvent event, Emitter<TrackingState> emit) async {
    emit(TrackingLoading(event.reference));
    try {
      final result = await _dataSource.scanQr(event.reference);
      emit(TrackingLoaded(result));
    } catch (e) {
      emit(TrackingError(e.toString()));
    }
  }

  Future<void> _onLookupReference(
      LookupReferenceEvent event, Emitter<TrackingState> emit) async {
    emit(TrackingLoading(event.reference));
    try {
      final result = await _dataSource.getTrackingInfo(event.reference);
      emit(TrackingLoaded(result));
    } catch (e) {
      emit(TrackingError(e.toString()));
    }
  }
}
