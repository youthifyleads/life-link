import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../blood_requests/presentation/bloc/blood_request_bloc.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class DonationFeedScreen extends StatelessWidget {
  const DonationFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<BloodRequestBloc>()..add(LoadRequestsEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Donation Feed'),
          actions: [
            const NotificationBadgeButton(),
            IconButton(
              icon: const Icon(Icons.person_outline_rounded),
              tooltip: 'Profile & Eligibility',
              onPressed: () => context.push('/profile'),
            ),
          ],
        ),
        body: BlocConsumer<BloodRequestBloc, BloodRequestState>(
          listenWhen: (prev, curr) =>
              curr is BloodRequestRespondSuccess || curr is BloodRequestError,
          listener: (context, state) {
            if (state is BloodRequestRespondSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content:
                      Text('Thank you! You are matched with this request.'),
                  backgroundColor: AppColors.success,
                ),
              );
              // Refresh feed to show updated status
              context.read<BloodRequestBloc>().add(LoadRequestsEvent());
            } else if (state is BloodRequestError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: AppColors.error,
                ),
              );
            }
          },
          buildWhen: (prev, curr) =>
              curr is BloodRequestLoading ||
              curr is BloodRequestLoaded ||
              curr is BloodRequestResponding,
          builder: (context, state) {
            if (state is BloodRequestLoading) {
              return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary));
            }

            if (state is BloodRequestLoaded ||
                state is BloodRequestResponding) {
              final requests = state is BloodRequestLoaded
                  ? state.requests
                  : (state as BloodRequestResponding).requests;
              // Filter to show only "requested" status to donors
              final activeRequests =
                  requests.where((r) => r.status == 'requested').toList();

              if (activeRequests.isEmpty) {
                return _buildEmptyState(context);
              }

              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  context.read<BloodRequestBloc>().add(LoadRequestsEvent());
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: activeRequests.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final req = activeRequests[index];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: req.urgency
                                      ? AppColors.error
                                      : AppColors.primary,
                                  child: Text(
                                    req.bloodType,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Needs ${req.quantityUnits} Units • ${req.component}',
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.copyWith(
                                                fontWeight: FontWeight.bold),
                                      ),
                                      if (req.urgency)
                                        const Text('Urgent Request',
                                            style: TextStyle(
                                                color: AppColors.error,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            if (req.reason != null) ...[
                              Text('Reason: ${req.reason}',
                                  style: const TextStyle(
                                      color: AppColors.textSecondary)),
                              const SizedBox(height: 8),
                            ],
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: LifeLinkButton(
                                label: 'I Can Donate',
                                icon: Icons.volunteer_activism,
                                onPressed: state is BloodRequestResponding
                                    ? null
                                    : () {
                                        context
                                            .read<BloodRequestBloc>()
                                            .add(RespondToRequestEvent(req.id));
                                      },
                              ),
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.favorite_border,
              size: 64, color: AppColors.textHint),
          const SizedBox(height: 16),
          Text(
            'No Active Requests',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          const Text('You will be notified when someone needs your blood type.',
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
