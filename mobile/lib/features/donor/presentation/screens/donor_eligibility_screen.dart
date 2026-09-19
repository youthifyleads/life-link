import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../bloc/donor_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../../core/widgets/lifelink_components.dart';

class DonorEligibilityScreen extends StatelessWidget {
  const DonorEligibilityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<DonorBloc>()..add(LoadDonorProfileEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Donation Eligibility & History'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_rounded),
            onPressed: () => context.pop(),
          ),
        ),
        body: BlocBuilder<DonorBloc, DonorState>(
          builder: (context, state) {
            if (state is DonorLoading) {
              return const LifeLinkLoadingState(
                message: 'Checking your donation eligibility…',
              );
            }

            if (state is DonorError) {
              return LifeLinkStatePanel(
                icon: Icons.cloud_off_rounded,
                title: 'Eligibility is unavailable',
                message: state.message,
                actionLabel: 'Try again',
                onAction: () =>
                    context.read<DonorBloc>().add(LoadDonorProfileEvent()),
                tone: AppColors.error,
              );
            }

            if (state is DonorLoaded) {
              final profile = state.profile;
              final history = state.history;

              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async =>
                    context.read<DonorBloc>().add(LoadDonorProfileEvent()),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── 6-Month Eligibility Status Card ──────────────
                      _buildEligibilityCard(context, profile),

                      const SizedBox(height: 24),

                      // ── Donation History Section ─────────────────────
                      Text(
                        'Donation History',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 12),

                      if (history.isEmpty)
                        const LifeLinkStatePanel(
                          icon: Icons.history_rounded,
                          title: 'No donations recorded',
                          message:
                              'Completed donations returned by LifeLink will appear here.',
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: history.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = history[index];
                            return LifeLinkHistoryCard(
                              title: item.bloodBankId ??
                                  'Donation center unavailable',
                              date: item.donationDate == null
                                  ? 'Date unavailable'
                                  : DateFormat('MMMM d, yyyy')
                                      .format(item.donationDate!),
                              status: item.status,
                              trailing: item.status.toLowerCase() == 'completed'
                                  ? TextButton(
                                      onPressed: () => context.push(
                                        '/donor/voucher',
                                        extra: item.id,
                                      ),
                                      child: const Text('View voucher'),
                                    )
                                  : null,
                            );
                          },
                        ),
                    ],
                  ),
                ),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildEligibilityCard(BuildContext context, dynamic profile) {
    final status = profile.eligibilityStatus;
    final isEligible = status.toLowerCase() == 'eligible';

    final Color statusColor =
        isEligible ? AppColors.success : AppColors.warning;
    final IconData statusIcon =
        isEligible ? Icons.verified_rounded : Icons.hourglass_top_rounded;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: statusColor.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        children: [
          Icon(statusIcon, color: statusColor, size: 56),
          const SizedBox(height: 12),
          Text(
            'Medical eligibility: $status',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: statusColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This status is provided by the Azure donor profile contract. '
            'No local countdown is calculated.',
            textAlign: TextAlign.center,
            style:
                const TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.water_drop,
                    color: AppColors.primary, size: 16),
                const SizedBox(width: 6),
                Text(
                  'Blood Group: ${profile.bloodType}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
