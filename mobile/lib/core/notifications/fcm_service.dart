import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:go_router/go_router.dart';

import '../constants/api_endpoints.dart';
import '../routing/app_router.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {}

class FcmService {
  static final _localNotifications = FlutterLocalNotificationsPlugin();
  static const _channel = AndroidNotificationChannel(
    'lifelink_updates',
    'LifeLink updates',
    description: 'Blood donation and request notifications.',
    importance: Importance.high,
    playSound: true,
  );

  static Future<void> initialize() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(
      android: android,
      iOS: DarwinInitializationSettings(),
    );
    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (response) =>
          _openNotificationRoute(response.payload),
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
    FirebaseMessaging.onMessage.listen(_showForegroundNotification);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageTap);
    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) _handleMessageTap(initialMessage);
  }

  static Future<bool> registerDevice(Dio dio) async {
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

  static Future<void> _showForegroundNotification(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title']?.toString();
    final body = notification?.body ?? message.data['body']?.toString();
    if ((title == null || title.isEmpty) && (body == null || body.isEmpty)) {
      return;
    }
    await _localNotifications.show(
      notification.hashCode,
      title ?? 'LifeLink',
      body ?? 'New LifeLink notification',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'lifelink_updates',
          'LifeLink updates',
          channelDescription: 'Blood donation and request notifications.',
          importance: Importance.high,
          priority: Priority.high,
          playSound: true,
        ),
        iOS: DarwinNotificationDetails(presentSound: true),
      ),
      payload: _requestId(message.data),
    );
  }

  static void _handleMessageTap(RemoteMessage message) {
    _openNotificationRoute(_requestId(message.data));
  }

  static String? _requestId(Map<String, dynamic> data) {
    final value = data['related_request_id'] ??
        data['request_id'] ??
        data['blood_request_id'];
    return value is String && value.isNotEmpty ? value : null;
  }

  static void _openNotificationRoute(String? requestId) {
    final context = AppRouter.navigatorKey.currentContext;
    if (context == null) return;
    context.go(requestId == null
        ? '/notifications'
        : '/donor/request?requestId=${Uri.encodeComponent(requestId)}');
  }
}
