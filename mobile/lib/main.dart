import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';

import 'core/di/injection.dart';
import 'core/notifications/fcm_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase init (safe fallback if google-services.json is not yet supplied in dev)
  try {
    await Firebase.initializeApp();
    await FcmService.initialize();
  } catch (e) {
    debugPrint(
        'Firebase not initialized (missing google-services.json in dev): $e');
  }

  // Dependency Injection setup
  configureDependencies();

  runApp(const LifeLinkApp());
}
