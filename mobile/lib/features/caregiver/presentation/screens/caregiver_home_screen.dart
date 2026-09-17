import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class CaregiverHomeScreen extends StatelessWidget {
  const CaregiverHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Care coordination'),
        actions: [
          const NotificationBadgeButton(),
          IconButton(
            tooltip: 'Profile and settings',
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          AppSpacing.xxl,
        ),
        children: [
          _AttentionBanner(onTap: () => context.push('/caregiver/requests')),
          const SizedBox(height: AppSpacing.lg),
          Text('Care workspace', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.md),
          _WorkspaceTile(
            icon: Icons.bloodtype_outlined,
            title: 'Blood requests',
            subtitle: 'Create and follow patient requests',
            accent: AppColors.primary,
            onTap: () => context.push('/caregiver/requests'),
          ),
          _WorkspaceTile(
            icon: Icons.people_alt_outlined,
            title: 'Patients',
            subtitle: 'Review patient profiles and blood types',
            accent: AppColors.teal,
            onTap: () => context.push('/caregiver/patients'),
          ),
          _WorkspaceTile(
            icon: Icons.assignment_outlined,
            title: 'Assignments',
            subtitle: 'Review blood-bag assignments and notes',
            accent: AppColors.navy,
            onTap: () => context.push('/caregiver/assignments'),
          ),
          _WorkspaceTile(
            icon: Icons.inventory_2_outlined,
            title: 'Blood bags',
            subtitle: 'Review bag status and movement history',
            accent: AppColors.teal,
            onTap: () => context.push('/caregiver/blood-bags'),
          ),
          _WorkspaceTile(
            icon: Icons.qr_code_scanner_rounded,
            title: 'Scan and track',
            subtitle: 'Use the real QR and tracking workflow',
            accent: AppColors.info,
            onTap: () => context.push('/qr/scan'),
          ),
          _WorkspaceTile(
            icon: Icons.payments_outlined,
            title: 'Payments',
            subtitle: 'Review request-specific payment history',
            accent: AppColors.warning,
            onTap: () => context.push('/caregiver/payment-history'),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('Need a walkthrough?',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          TextButton.icon(
            onPressed: () => context.push('/help/caregiver'),
            icon: const Icon(Icons.menu_book_outlined),
            label: const Text('How LifeLink works'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          ),
        ],
      ),
    );
  }
}

class _AttentionBanner extends StatelessWidget {
  final VoidCallback onTap;

  const _AttentionBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: AppRadii.lg,
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.navy, AppColors.secondaryBlue],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: AppRadii.lg,
          boxShadow: AppShadows.soft,
        ),
        child: Row(
          children: [
            const Icon(Icons.task_alt_rounded, color: Colors.white, size: 34),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Stay on top of care',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    'Open requests and review the latest backend status.',
                    style: TextStyle(color: Color(0xFFD7E3E8)),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_rounded, color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class _WorkspaceTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accent;
  final VoidCallback onTap;

  const _WorkspaceTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accent,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        minVerticalPadding: AppSpacing.sm,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.12),
            borderRadius: AppRadii.sm,
          ),
          child: Icon(icon, color: accent),
        ),
        title: Text(title, style: Theme.of(context).textTheme.titleMedium),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: onTap,
      ),
    );
  }
}
