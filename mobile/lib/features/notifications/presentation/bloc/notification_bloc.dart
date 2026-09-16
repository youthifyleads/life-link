import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/notification_model.dart';
import '../../data/notification_remote_datasource.dart';

// ── Events ────────────────────────────────────────────────
abstract class NotificationEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadNotificationsEvent extends NotificationEvent {}

class MarkNotificationReadEvent extends NotificationEvent {
  final String notificationId;
  MarkNotificationReadEvent(this.notificationId);
  @override
  List<Object?> get props => [notificationId];
}

class MarkAllReadEvent extends NotificationEvent {}

// ── States ────────────────────────────────────────────────
abstract class NotificationState extends Equatable {
  @override
  List<Object?> get props => [];
}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationLoaded extends NotificationState {
  final List<NotificationModel> notifications;
  final int unreadCount;

  NotificationLoaded(this.notifications)
      : unreadCount = notifications.where((n) => !n.isRead).length;

  @override
  List<Object?> get props => [notifications, unreadCount];
}

class NotificationError extends NotificationState {
  final String message;
  NotificationError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationRemoteDataSource _dataSource;
  List<NotificationModel> _currentList = [];

  NotificationBloc(this._dataSource) : super(NotificationInitial()) {
    on<LoadNotificationsEvent>(_onLoad);
    on<MarkNotificationReadEvent>(_onMarkRead);
    on<MarkAllReadEvent>(_onMarkAllRead);
  }

  Future<void> _onLoad(
      LoadNotificationsEvent event, Emitter<NotificationState> emit) async {
    emit(NotificationLoading());
    try {
      _currentList = await _dataSource.getNotifications();
      // Sort: unread first, then newest first
      _currentList.sort((a, b) {
        if (a.isRead != b.isRead) return a.isRead ? 1 : -1;
        return b.createdAt.compareTo(a.createdAt);
      });
      emit(NotificationLoaded(_currentList));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onMarkRead(
      MarkNotificationReadEvent event, Emitter<NotificationState> emit) async {
    try {
      await _dataSource.markAsRead(event.notificationId);
      _currentList = _currentList.map((n) {
        return n.id == event.notificationId ? n.copyWithRead() : n;
      }).toList();
      emit(NotificationLoaded(_currentList));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onMarkAllRead(
      MarkAllReadEvent event, Emitter<NotificationState> emit) async {
    try {
      final unread = _currentList.where((n) => !n.isRead).toList();
      for (final n in unread) {
        await _dataSource.markAsRead(n.id);
      }
      _currentList = _currentList.map((n) => n.copyWithRead()).toList();
      emit(NotificationLoaded(_currentList));
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }
}
