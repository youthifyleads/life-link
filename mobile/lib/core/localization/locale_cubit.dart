import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LocaleCubit extends Cubit<Locale> {
  final FlutterSecureStorage _storage;
  static const String _languageKey = 'app_language_code';

  LocaleCubit(this._storage) : super(const Locale('ar')) {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    final savedCode = await _storage.read(key: _languageKey);
    if (savedCode != null && (savedCode == 'ar' || savedCode == 'en')) {
      emit(Locale(savedCode));
    } else {
      emit(const Locale('ar')); // Default to Arabic
    }
  }

  Future<void> changeLocale(String languageCode) async {
    if (languageCode == 'ar' || languageCode == 'en') {
      await _storage.write(key: _languageKey, value: languageCode);
      emit(Locale(languageCode));
    }
  }

  bool get isArabic => state.languageCode == 'ar';
}
