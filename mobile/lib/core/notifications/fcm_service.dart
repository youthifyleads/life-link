import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../constants/api_endpoints.dart';

class FcmService {
  static Future<bool> initialize(Dio dio) async {
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();
    final token = await messaging.getToken();
    if (token == null || token.isEmpty) return false;
    await dio.post(
      ApiEndpoints.notificationDevices,
      data: {'token': token, 'provider': 'fcm'},
    );
    return true;
  }
}
