import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../blood_requests/presentation/bloc/blood_request_bloc.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class CaregiverRequestsScreen extends StatelessWidget {
  const CaregiverRequestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<BloodRequestBloc>()..add(LoadRequestsEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Blood Requests'),
          actions: [
            const NotificationBadgeButton(),
            IconButton(
              icon: const Icon(Icons.person_outline_rounded),
              tooltip: 'Profile & Settings',
              onPressed: () => context.push('/profile'),
            ),
          ],
        ),
        body: BlocBuilder<BloodRequestBloc, BloodRequestState>(
          builder: (context, state) {
            if (state is BloodRequestLoading) {
              return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary));
            }
            if (state is BloodRequestError) {
              return Center(
                child: Text(
                  'Error loading requests:\n${state.message}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.error),
                ),
              );
            }
            if (state is BloodRequestLoaded) {
              final requests = state.requests;
              if (requests.isEmpty) {
                return _buildEmptyState(context);
              }
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  final bloc = context.read<BloodRequestBloc>();
                  bloc.add(LoadRequestsEvent());
                  await bloc.stream.firstWhere(
                    (state) =>
                        state is BloodRequestLoaded ||
                        state is BloodRequestError,
                  );
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: requests.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final req = requests[index];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor:
                              req.urgency ? AppColors.error : AppColors.primary,
                          child: Text(req.bloodType,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold)),
                        ),
                        title: Text(
                            '${req.quantityUnits} Units • ${req.component}'),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                              'Status: ${req.status}\nRef: ${req.trackingReference}'),
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        isThreeLine: true,
                        onTap: () {
                          context.push('/caregiver/request/details',
                              extra: req);
                        },
                      ),
                    );
                  },
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
        floatingActionButton: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // QR Scanner
            FloatingActionButton(
              heroTag: 'qr_scan',
              onPressed: () => context.push('/qr/scan'),
              backgroundColor: AppColors.info,
              foregroundColor: Colors.white,
              child: const Icon(Icons.qr_code_scanner),
            ),
            const SizedBox(height: 12),
            // New Request
            Builder(
              builder: (ctx) => FloatingActionButton.extended(
                heroTag: 'new_request',
                onPressed: () async {
                  final result =
                      await context.push('/caregiver/create-request');
                  if (result == true && ctx.mounted) {
                    ctx.read<BloodRequestBloc>().add(LoadRequestsEvent());
                  }
                },
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                icon: const Icon(Icons.add),
                label: const Text('New Request'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.medical_services_outlined,
              size: 64, color: AppColors.textHint),
          const SizedBox(height: 16),
          Text(
            'No Requests Found',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          const Text('Tap the + button to create a new blood request.'),
        ],
      ),
    );
  }
}
