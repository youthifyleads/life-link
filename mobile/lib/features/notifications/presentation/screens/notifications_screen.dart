import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../bloc/notification_bloc.dart';
import '../../../../core/theme/app_colors.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationLoaded && state.unreadCount > 0) {
                return TextButton(
                  onPressed: () =>
                      context.read<NotificationBloc>().add(MarkAllReadEvent()),
                  child: const Text(
                    'Mark all read',
                    style: TextStyle(color: AppColors.primary),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading) {
            return const Center(
                child: CircularProgressIndicator(color: AppColors.primary));
          }

          if (state is NotificationError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.wifi_off_rounded,
                      size: 48, color: AppColors.textHint),
                  const SizedBox(height: 12),
                  Text(state.message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => context
                        .read<NotificationBloc>()
                        .add(LoadNotificationsEvent()),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is NotificationLoaded) {
            if (state.notifications.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none_rounded,
                        size: 64, color: AppColors.textHint),
                    SizedBox(height: 16),
                    Text('No notifications yet',
                        style: TextStyle(
                            color: AppColors.textSecondary, fontSize: 16)),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async => context
                  .read<NotificationBloc>()
                  .add(LoadNotificationsEvent()),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: state.notifications.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, indent: 72),
                itemBuilder: (context, index) {
                  final n = state.notifications[index];
                  return _NotificationTile(notification: n);
                },
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final dynamic notification; // NotificationModel

  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context) {
    final isUnread = !notification.isRead;

    return InkWell(
      onTap: () {
        if (isUnread) {
          context
              .read<NotificationBloc>()
              .add(MarkNotificationReadEvent(notification.id));
        }
        // If there's a related request, navigate to its details
        // (will be wired once backend adds request lookup by ID)
      },
      child: Container(
        color: isUnread ? AppColors.primaryLight : Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon with unread indicator
            Stack(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: _triggerColor().withValues(alpha: 0.15),
                  child: Icon(_triggerIcon(), color: _triggerColor(), size: 22),
                ),
                if (isUnread)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _triggerLabel(),
                    style: TextStyle(
                      fontWeight: isUnread ? FontWeight.bold : FontWeight.w500,
                      color: AppColors.textPrimary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.message,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    timeago.format(notification.createdAt.toLocal()),
                    style: const TextStyle(
                        color: AppColors.textHint, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _triggerColor() {
    switch (notification.trigger) {
      case 'URGENT_REQUEST':
        return AppColors.error;
      case 'REQUEST_CREATED':
        return AppColors.primary;
      case 'REQUEST_ACKNOWLEDGED':
        return AppColors.info;
      case 'REQUEST_STATUS_CHANGED':
        return AppColors.success;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _triggerIcon() {
    switch (notification.trigger) {
      case 'URGENT_REQUEST':
        return Icons.emergency_rounded;
      case 'REQUEST_CREATED':
        return Icons.add_circle_outline_rounded;
      case 'REQUEST_ACKNOWLEDGED':
        return Icons.thumb_up_rounded;
      case 'REQUEST_STATUS_CHANGED':
        return Icons.sync_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  String _triggerLabel() {
    switch (notification.trigger) {
      case 'URGENT_REQUEST':
        return '🚨 Urgent Blood Request';
      case 'REQUEST_CREATED':
        return 'New Request';
      case 'REQUEST_ACKNOWLEDGED':
        return 'Request Acknowledged';
      case 'REQUEST_STATUS_CHANGED':
        return 'Status Updated';
      default:
        return 'Notification';
    }
  }
}
