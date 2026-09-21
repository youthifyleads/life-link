import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../di/injection.dart';
import 'app_strings.dart';
import 'locale_cubit.dart';

extension LocalizationExtension on BuildContext {
  /// True if current app locale is Arabic ('ar')
  bool get isArabic {
    try {
      if (owner?.debugBuilding ?? false) {
        return watch<LocaleCubit>().isArabic;
      }
      return read<LocaleCubit>().isArabic;
    } catch (_) {
      try {
        return read<LocaleCubit>().isArabic;
      } catch (_) {
        try {
          return getIt<LocaleCubit>().isArabic;
        } catch (_) {
          return Localizations.maybeLocaleOf(this)?.languageCode == 'ar';
        }
      }
    }
  }

  /// True if current app locale is English ('en')
  bool get isEnglish => !isArabic;

  /// Translates [key] according to current active locale
  String tr(String key) {
    try {
      final locale = (owner?.debugBuilding ?? false)
          ? watch<LocaleCubit>().state.languageCode
          : read<LocaleCubit>().state.languageCode;
      return AppStrings.get(key, locale: locale);
    } catch (_) {
      try {
        return AppStrings.get(key, locale: read<LocaleCubit>().state.languageCode);
      } catch (_) {
        try {
          return AppStrings.get(key, locale: getIt<LocaleCubit>().state.languageCode);
        } catch (_) {
          return AppStrings.get(
            key,
            locale: Localizations.maybeLocaleOf(this)?.languageCode ?? 'ar',
          );
        }
      }
    }
  }
}
