import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkCard extends StatelessWidget {
  const LifeLinkCard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadii.borderMd,
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

class LifeLinkBloodTypeBadge extends StatelessWidget {
  const LifeLinkBloodTypeBadge(this.bloodType, {super.key});

  final String bloodType;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        bloodType,
        style: const TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class LifeLinkStatusChip extends StatelessWidget {
  const LifeLinkStatusChip(this.status, {super.key});

  final String status;

  @override
  Widget build(BuildContext context) {
    final label = status.toLowerCase();
    final color = switch (label) {
      'paid' || 'completed' || 'confirmed' || 'success' => AppColors.success,
      'pending' || 'created' || 'acknowledged' => AppColors.warning,
      'failed' || 'cancelled' || 'rejected' || 'expired' => AppColors.error,
      _ => AppColors.info,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class LifeLinkTimeline extends StatelessWidget {
  const LifeLinkTimeline({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }
}

class LifeLinkMatchCard extends StatelessWidget {
  const LifeLinkMatchCard({
    super.key,
    required this.donorLabel,
    required this.bloodType,
    required this.status,
    this.distance,
  });

  final String donorLabel;
  final String bloodType;
  final String status;
  final String? distance;

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      child: Row(
        children: [
          LifeLinkBloodTypeBadge(bloodType),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(donorLabel,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(status,
                    style: const TextStyle(color: AppColors.textSecondary)),
                if (distance != null) ...[
                  const SizedBox(height: 4),
                  Text(distance!,
                      style: const TextStyle(color: AppColors.info)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class LifeLinkHistoryCard extends StatelessWidget {
  const LifeLinkHistoryCard({
    super.key,
    required this.title,
    required this.date,
    required this.status,
    this.trailing,
  });

  final String title;
  final String date;
  final String status;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(date,
                    style: const TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                LifeLinkStatusChip(status),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
