import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app_strings.dart';
import 'locale_cubit.dart';

extension LocalizationExtension on BuildContext {
  /// True if current app locale is Arabic ('ar')
  bool get isArabic => watch<LocaleCubit>().isArabic;

  /// True if current app locale is English ('en')
  bool get isEnglish => !isArabic;

  /// Translates [key] according to current active locale
  String tr(String key) {
    final locale = watch<LocaleCubit>().state.languageCode;
    return AppStrings.get(key, locale: locale);
  }
}
