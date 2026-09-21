import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../bloc/donor_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../../core/widgets/lifelink_components.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';

class DonorEligibilityScreen extends StatelessWidget {
  const DonorEligibilityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<DonorBloc>()..add(LoadDonorProfileEvent()),
      child: Scaffold(
        appBar: const LifeLinkDetailAppBar(
          title: 'أهلية وسجل التبرع',
        ),
        body: BlocBuilder<DonorBloc, DonorState>(
          builder: (context, state) {
            if (state is DonorLoading) {
              return const LifeLinkLoadingState(
                message: 'جاري التحقق من أهلية وسجل التبرع...',
              );
            }

            if (state is DonorError) {
              return LifeLinkStatePanel(
                icon: Icons.cloud_off_rounded,
                title: 'تعذر تحميل بيانات الأهلية',
                message: state.message,
                actionLabel: 'إعادة المحاولة',
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

                      const SizedBox(height: 16),

                      // ── Quick Actions: Quiz & Guide ──────────────
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => context.push('/donor/medical-quiz'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(color: AppColors.primary, width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.fact_check_outlined, size: 18, color: AppColors.primary),
                              label: const Text(
                                'فحص الأهلية الطبي',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Cairo',
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => context.push('/donor/guide'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(color: AppColors.border, width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.menu_book_rounded, size: 18, color: AppColors.textPrimary),
                              label: const Text(
                                'دليل التبرع المصري',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Cairo',
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // ── Stats Row ────────────────────────────────────
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              context,
                              icon: Icons.volunteer_activism,
                              label: 'إجمالي مرات التبرع',
                              value: '${history.length}',
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // ── Donation History Section ─────────────────────
                      Text(
                        'سجل التبرعات السابقة',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 12),

                      if (history.isEmpty)
                        const LifeLinkStatePanel(
                          icon: Icons.history_rounded,
                          title: 'لا توجد تبرعات سابقة مسجلة',
                          message:
                              'ستظهر هنا التبرعات المعتمدة ومكافآت التقدير فور توثيقها في بنك الدم.',
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
                                  'مركز تبرع معتمد',
                              date: item.donationDate == null
                                  ? 'تاريخ غير محدد'
                                  : DateFormat('d MMMM yyyy')
                                      .format(item.donationDate!),
                              status: item.status == 'completed'
                                  ? 'مكتمل'
                                  : item.status,
                              trailing: item.status.toLowerCase() == 'completed'
                                  ? TextButton(
                                      onPressed: () => context.push(
                                        '/donor/voucher',
                                        extra: item.id,
                                      ),
                                      child: const Text('عرض قسيمة التقدير'),
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
            isEligible ? 'مؤهل للتبرع بالدم الآن' : 'غير متاح للتبرع حالياً',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: statusColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isEligible
                ? 'أنت مستوفٍ لكافة المعايير الطبية وجاهز للمساهمة في إنقاذ حياة مصاب أو مريض.'
                : daysLeft > 0
                    ? 'حرصاً على صحتك، يلزم استكمال فترة الأمان الطبية المقررة بين التبرعات (متبقي $daysLeft يوم).'
                    : 'يتم احتساب الأهلية بناءً على تاريخ آخر تبرع والضوابط الصحية المعتمدة (180 يوماً).',
            textAlign: TextAlign.center,
            style:
                const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
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
                  'فصيلة الدم: ${profile.bloodType}',
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
