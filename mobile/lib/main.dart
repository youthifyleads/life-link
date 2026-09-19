import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:dio/dio.dart';

import 'core/di/injection.dart';
import 'core/notifications/fcm_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase init (safe fallback if google-services.json is not yet supplied in dev)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint(
        'Firebase not initialized (missing google-services.json in dev): $e');
  }

  // Dependency Injection setup
  configureDependencies();
  try {
    await FcmService.initialize(getIt<Dio>());
  } catch (e) {
    debugPrint('Push notification registration unavailable: $e');
  }

  runApp(const LifeLinkApp());
}
