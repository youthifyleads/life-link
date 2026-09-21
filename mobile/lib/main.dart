import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:dio/dio.dart';

import 'core/di/injection.dart';
import 'core/notifications/fcm_service.dart';
import 'app.dart';

import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase init with platform options (supports Web, Android, and iOS safely)
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase init fallback: $e');
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
