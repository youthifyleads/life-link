import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;

  const LifeLinkCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.md),
    this.margin,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.soft,
      ),
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: AppRadii.md,
        child: card,
      );
    }

    return card;
  }
}

class LifeLinkStatusChip extends StatelessWidget {
  final String status;

  const LifeLinkStatusChip(this.status, {super.key});

  Color _getStatusColor() {
    final lower = status.toLowerCase();
    if (lower.contains('completed') ||
        lower.contains('paid') ||
        lower.contains('success') ||
        lower.contains('eligible') ||
        lower.contains('accepted')) {
      return AppColors.success;
    }
    if (lower.contains('pending') ||
        lower.contains('in_progress') ||
        lower.contains('transit') ||
        lower.contains('processing')) {
      return AppColors.warning;
    }
    if (lower.contains('failed') ||
        lower.contains('rejected') ||
        lower.contains('cancelled') ||
        lower.contains('expired')) {
      return AppColors.error;
    }
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: AppRadii.full,
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class LifeLinkBloodTypeBadge extends StatelessWidget {
  final String bloodType;
  final double size;

  const LifeLinkBloodTypeBadge(this.bloodType, {super.key, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary, width: 1.5),
      ),
      child: Text(
        bloodType,
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.w800,
          fontSize: size * 0.38,
        ),
      ),
    );
  }
}

class LifeLinkHistoryCard extends StatelessWidget {
  final String title;
  final String date;
  final String status;
  final Widget? trailing;

  const LifeLinkHistoryCard({
    super.key,
    required this.title,
    required this.date,
    required this.status,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
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

class LifeLinkTimeline extends StatelessWidget {
  final List<Widget> children;

  const LifeLinkTimeline({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children
          .map((child) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: child,
              ))
          .toList(),
    );
  }
}

class LifeLinkMatchCard extends StatelessWidget {
  final String donorLabel;
  final String bloodType;
  final String status;
  final String? distance;
  final VoidCallback? onTap;

  const LifeLinkMatchCard({
    super.key,
    required this.donorLabel,
    required this.bloodType,
    required this.status,
    this.distance,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      onTap: onTap,
      child: Row(
        children: [
          LifeLinkBloodTypeBadge(bloodType),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  donorLabel,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (distance != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    distance!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          LifeLinkStatusChip(status),
        ],
      ),
    );
  }
}
