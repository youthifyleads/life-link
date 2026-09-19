import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';

class LifeLinkTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final bool obscureText;
  final TextInputType keyboardType;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final String? Function(String?)? validator;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onFieldSubmitted;
  final bool readOnly;
  final VoidCallback? onTap;
  final String? helperText;
  final TextDirection? textDirection;
  final TextAlign textAlign;

  const LifeLinkTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.validator,
    this.textInputAction,
    this.autofillHints,
    this.onFieldSubmitted,
    this.readOnly = false,
    this.onTap,
    this.helperText,
    this.textDirection,
    this.textAlign = TextAlign.start,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label.isNotEmpty) ...[
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          textDirection: textDirection,
          textAlign: textAlign,
          validator: validator,
          textInputAction: textInputAction,
          autofillHints: autofillHints,
          onFieldSubmitted: onFieldSubmitted,
          readOnly: readOnly,
          onTap: onTap,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 15,
            fontWeight: FontWeight.w600,
            fontFamily: 'Cairo',
          ),
          decoration: InputDecoration(
            hintText: hint,
            helperText: helperText,
            fillColor: Colors.white,
            filled: true,
            prefixIcon: prefixIcon != null
                ? Icon(prefixIcon, color: AppColors.textSecondary, size: 20)
                : null,
            suffixIcon: suffixIcon != null
                ? InkWell(
                    borderRadius: AppRadii.full,
                    onTap: onSuffixTap,
                    child: Icon(suffixIcon, color: AppColors.textHint, size: 20),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}
