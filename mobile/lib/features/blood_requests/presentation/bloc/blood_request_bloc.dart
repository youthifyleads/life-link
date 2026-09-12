import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/blood_request_model.dart';
import '../../data/blood_request_remote_datasource.dart';

// ── Events ────────────────────────────────────────────────
abstract class BloodRequestEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadRequestsEvent extends BloodRequestEvent {}

class CreateRequestEvent extends BloodRequestEvent {
  final BloodRequestCreate data;
  CreateRequestEvent(this.data);
  @override
  List<Object?> get props => [data];
}

class RespondToRequestEvent extends BloodRequestEvent {
  final String requestId;
  RespondToRequestEvent(this.requestId);
  @override
  List<Object?> get props => [requestId];
}

// ── States ────────────────────────────────────────────────
abstract class BloodRequestState extends Equatable {
  @override
  List<Object?> get props => [];
}

class BloodRequestInitial extends BloodRequestState {}

class BloodRequestLoading extends BloodRequestState {}

class BloodRequestLoaded extends BloodRequestState {
  final List<BloodRequestPublic> requests;
  BloodRequestLoaded(this.requests);
  @override
  List<Object?> get props => [requests];
}

class BloodRequestCreating extends BloodRequestState {}

class BloodRequestCreateSuccess extends BloodRequestState {
  final BloodRequestPublic newRequest;
  BloodRequestCreateSuccess(this.newRequest);
  @override
  List<Object?> get props => [newRequest];
}

class BloodRequestResponding extends BloodRequestState {
  final String requestId;
  final List<BloodRequestPublic> requests;
  BloodRequestResponding(this.requestId, this.requests);
  @override
  List<Object?> get props => [requestId, requests];
}

class BloodRequestRespondSuccess extends BloodRequestState {
  final String requestId;
  BloodRequestRespondSuccess(this.requestId);
  @override
  List<Object?> get props => [requestId];
}

class BloodRequestError extends BloodRequestState {
  final String message;
  BloodRequestError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────
class BloodRequestBloc extends Bloc<BloodRequestEvent, BloodRequestState> {
  final BloodRequestRemoteDataSource _dataSource;

  BloodRequestBloc(this._dataSource) : super(BloodRequestInitial()) {
    on<LoadRequestsEvent>(_onLoadRequests);
    on<CreateRequestEvent>(_onCreateRequest);
    on<RespondToRequestEvent>(_onRespondToRequest);
  }

  Future<void> _onLoadRequests(
    LoadRequestsEvent event,
    Emitter<BloodRequestState> emit,
  ) async {
    emit(BloodRequestLoading());
    try {
      final requests = await _dataSource.getRequests();
      emit(BloodRequestLoaded(requests));
    } catch (e) {
      emit(BloodRequestError(e.toString()));
    }
  }

  Future<void> _onCreateRequest(
    CreateRequestEvent event,
    Emitter<BloodRequestState> emit,
  ) async {
    emit(BloodRequestCreating());
    try {
      final newReq = await _dataSource.createRequest(event.data);
      emit(BloodRequestCreateSuccess(newReq));
    } catch (e) {
      emit(BloodRequestError(e.toString()));
    }
  }

  Future<void> _onRespondToRequest(
    RespondToRequestEvent event,
    Emitter<BloodRequestState> emit,
  ) async {
    final requests = state is BloodRequestLoaded
        ? (state as BloodRequestLoaded).requests
        : const <BloodRequestPublic>[];
    emit(BloodRequestResponding(event.requestId, requests));
    try {
      await _dataSource.respondToRequest(event.requestId);
      emit(BloodRequestRespondSuccess(event.requestId));
    } catch (e) {
      emit(BloodRequestError(e.toString()));
    }
  }
}
