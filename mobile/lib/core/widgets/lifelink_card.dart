import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color backgroundColor;
  final BorderRadius borderRadius;
  final Border? border;
  final List<BoxShadow>? boxShadow;

  const LifeLinkCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.md),
    this.onTap,
    this.backgroundColor = Colors.white,
    this.borderRadius = AppRadii.lg,
    this.border,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: borderRadius,
        border: border ?? Border.all(color: AppColors.border.withValues(alpha: 0.6)),
        boxShadow: boxShadow ?? AppShadows.soft,
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: borderRadius,
          onTap: onTap,
          child: content,
        ),
      );
    }

    return content;
  }
}
