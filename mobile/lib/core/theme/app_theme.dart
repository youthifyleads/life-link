import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'design_tokens.dart';

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.secondaryBlue,
        onSecondary: Colors.white,
        surface: AppColors.surface,
        surfaceContainerHighest: AppColors.surfaceVariant,
        error: AppColors.error,
        onSurface: AppColors.textPrimary,
      ),
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'Cairo', // Fallback to Cairo if defined in pubspec
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
            fontSize: 32,
            height: 1.15,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary),
        headlineMedium: TextStyle(
            fontSize: 28,
            height: 1.2,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary),
        headlineSmall: TextStyle(
            fontSize: 23,
            height: 1.25,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary),
        titleLarge: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary),
        titleMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary),
        bodyLarge: TextStyle(
            fontSize: 16,
            height: 1.5,
            fontWeight: FontWeight.w400,
            color: AppColors.textPrimary),
        bodyMedium: TextStyle(
            fontSize: 14,
            height: 1.45,
            fontWeight: FontWeight.w400,
            color: AppColors.textSecondary),
        labelLarge: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 1,
          shadowColor: AppColors.primary.withValues(alpha: 0.22),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadii.md,
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: 'Cairo',
          ),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFFFBFCFD),
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: AppRadii.md,
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadii.md,
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadii.md,
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadii.md,
          borderSide: BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppRadii.md,
          borderSide: BorderSide(color: AppColors.error, width: 2),
        ),
        hintStyle: TextStyle(color: AppColors.textHint),
        labelStyle: TextStyle(color: AppColors.textSecondary),
        errorStyle: TextStyle(
          color: AppColors.error,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 20,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          fontFamily: 'Cairo',
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadii.md,
          side: BorderSide(color: AppColors.border),
        ),
      ),
      chipTheme: const ChipThemeData(
        backgroundColor: AppColors.surfaceVariant,
        selectedColor: AppColors.primaryLight,
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: AppRadii.sm),
        labelStyle: TextStyle(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
        ),
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        minLeadingWidth: 40,
        iconColor: AppColors.textSecondary,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        modalBackgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        space: AppSpacing.lg,
      ),
    );
  }
}
