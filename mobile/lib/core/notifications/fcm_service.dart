class FcmService {
  static Future<bool> initialize() async {
    // Backend dependency: FCM/device-token registration is not available in the
    // current backend contract. Keep the integration point explicit and non-fake.
    // This app intentionally avoids registering fake devices or simulating push
    // delivery while the backend/FCM integration remains pending.
    return false;
  }
}
