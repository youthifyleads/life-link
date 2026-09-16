import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../features/notifications/presentation/bloc/notification_bloc.dart';

/// Shared notification bell icon with unread badge.
/// Wrap this in a MultiBlocProvider or provide NotificationBloc above it.
class NotificationBadgeButton extends StatelessWidget {
  const NotificationBadgeButton({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<NotificationBloc>()..add(LoadNotificationsEvent()),
      child: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          final unreadCount =
              state is NotificationLoaded ? state.unreadCount : 0;

          return IconButton(
            tooltip: 'Notifications',
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text(
                unreadCount > 9 ? '9+' : '$unreadCount',
                style: const TextStyle(fontSize: 10),
              ),
              backgroundColor: AppColors.error,
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () => context.push('/notifications'),
          );
        },
      ),
    );
  }
}
