import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final bool isOutlined;
  final bool isSecondary;
  final double height;
  final Color? backgroundColor;
  final Color? textColor;
  final double? fontSize;

  const LifeLinkButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.isOutlined = false,
    this.isSecondary = false,
    this.height = 50.0,
    this.backgroundColor,
    this.textColor,
    this.fontSize,
  });

  @override
  State<LifeLinkButton> createState() => _LifeLinkButtonState();
}

class _LifeLinkButtonState extends State<LifeLinkButton> {
  bool _isPressed = false;

  Color _getBaseColor() {
    if (widget.isOutlined) return Colors.transparent;
    if (widget.isSecondary) return widget.backgroundColor ?? AppColors.primaryLight;
    return widget.backgroundColor ?? AppColors.primary;
  }

  Color _getPressedColor(Color base) {
    if (widget.isOutlined) {
      return (widget.backgroundColor ?? AppColors.primary).withValues(alpha: 0.12);
    }
    if (widget.isSecondary) {
      return const Color(0xFFFFCDD2);
    }
    final hsl = HSLColor.fromColor(base);
    return hsl.withLightness((hsl.lightness - 0.14).clamp(0.0, 1.0)).toColor();
  }

  @override
  Widget build(BuildContext context) {
    final isEnabled = widget.onPressed != null && !widget.isLoading;
    final baseColor = _getBaseColor();
    final pressedColor = _getPressedColor(baseColor);
    final activeBgColor = isEnabled
        ? (_isPressed ? pressedColor : baseColor)
        : baseColor.withValues(alpha: 0.5);

    final defaultTextColor = widget.isOutlined || widget.isSecondary
        ? AppColors.primary
        : Colors.white;
    final contentColor = widget.textColor ?? defaultTextColor;

    return AnimatedScale(
      scale: _isPressed && isEnabled ? 0.985 : 1.0,
      duration: const Duration(milliseconds: 100),
      curve: Curves.easeOutCubic,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        height: widget.height,
        decoration: BoxDecoration(
          color: activeBgColor,
          borderRadius: AppRadii.md,
          border: widget.isOutlined
              ? Border.all(color: widget.backgroundColor ?? AppColors.primary, width: 1.5)
              : null,
          boxShadow: isEnabled && !widget.isOutlined && !widget.isSecondary && !_isPressed
              ? AppShadows.elevated
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: AppRadii.md,
            splashColor: Colors.white.withValues(alpha: 0.2),
            highlightColor: Colors.transparent,
            onTapDown: isEnabled ? (_) => setState(() => _isPressed = true) : null,
            onTapUp: isEnabled ? (_) => setState(() => _isPressed = false) : null,
            onTapCancel: isEnabled ? () => setState(() => _isPressed = false) : null,
            onTap: isEnabled ? widget.onPressed : null,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Center(
                child: _buildContent(contentColor),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(Color contentColor) {
    if (widget.isLoading) {
      return SizedBox(
        height: 22,
        width: 22,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation<Color>(contentColor),
        ),
      );
    }

    if (widget.icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(widget.icon, size: 20, color: contentColor),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              widget.label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: contentColor,
                fontSize: widget.fontSize ?? 15,
                fontWeight: FontWeight.w700,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ],
      );
    }

    return Text(
      widget.label,
      style: TextStyle(
        color: contentColor,
        fontSize: widget.fontSize ?? 15,
        fontWeight: FontWeight.w700,
        fontFamily: 'Cairo',
      ),
    );
  }
}
