import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../bloc/donor_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/di/injection.dart';

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
              return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary));
            }

            if (state is DonorError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: AppColors.error),
                    const SizedBox(height: 12),
                    Text(state.message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context
                          .read<DonorBloc>()
                          .add(LoadDonorProfileEvent()),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
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

                      // ── Stats Row ────────────────────────────────────
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              context,
                              icon: Icons.volunteer_activism,
                              label: 'Total Donations',
                              value: '${history.length}',
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildStatCard(
                              context,
                              icon: Icons.stars_rounded,
                              label: 'Reward Points',
                              value: '—',
                              color: AppColors.warning,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // ── Donation History Section ─────────────────────
                      Text(
                        'Donation History',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 12),

                      if (history.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(24),
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Center(
                            child: Text(
                              'No previous donations found.',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          ),
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
                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  const CircleAvatar(
                                    backgroundColor: AppColors.primaryLight,
                                    child: Icon(Icons.check_circle,
                                        color: AppColors.success),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.hospitalName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          DateFormat('MMMM d, yyyy')
                                              .format(item.donationDate),
                                          style: const TextStyle(
                                            color: AppColors.textHint,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.success
                                          .withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'Completed',
                                      style: TextStyle(
                                        color: AppColors.success,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
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
    final bool isEligible = profile.isEligible;
    final int daysLeft = profile.daysUntilEligible;

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
            isEligible ? 'Eligible to Donate' : 'Not Currently Eligible',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: statusColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isEligible
                ? 'The API reports that your donor profile is eligible.'
                : daysLeft > 0
                    ? 'The API reports that your donor profile is not eligible. Days remaining: $daysLeft.'
                    : 'Eligibility information is provided by your donor profile.',
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

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: color.withValues(alpha: 0.12),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style:
                const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
