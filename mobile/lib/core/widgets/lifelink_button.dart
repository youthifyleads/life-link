import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final bool isOutlined;

  const LifeLinkButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.isOutlined = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isOutlined) {
      return OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadii.md,
          ),
          minimumSize: const Size(double.infinity, 56),
        ),
        child: _buildContent(),
      );
    }

    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        minimumSize: const Size(double.infinity, 56),
        disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
      ),
      child: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (isLoading) {
      return SizedBox(
        height: 24,
        width: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation<Color>(
            isOutlined ? AppColors.primary : Colors.white,
          ),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon,
              size: 20, color: isOutlined ? AppColors.primary : Colors.white),
          const SizedBox(width: 8),
          Text(
            label,
            style:
                TextStyle(color: isOutlined ? AppColors.primary : Colors.white),
          ),
        ],
      );
    }

    return Text(
      label,
      style: TextStyle(color: isOutlined ? AppColors.primary : Colors.white),
    );
  }
}
