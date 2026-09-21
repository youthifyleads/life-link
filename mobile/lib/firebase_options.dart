// File generated for LifeLink dev environment
// Support for Web, Android, iOS fallback options to prevent null assertion errors in dev.
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyLifeLinkDevWebKeyForLocalTesting01',
    appId: '1:102938475610:web:8f3c7e9d2a1b4e6f',
    messagingSenderId: '102938475610',
    projectId: 'lifelink-dev-platform',
    authDomain: 'lifelink-dev-platform.firebaseapp.com',
    storageBucket: 'lifelink-dev-platform.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyLifeLinkDevAndroidKeyForTesting02',
    appId: '1:102938475610:android:9e4d8a2b5c7f1a3e',
    messagingSenderId: '102938475610',
    projectId: 'lifelink-dev-platform',
    storageBucket: 'lifelink-dev-platform.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyLifeLinkDevIosKeyForTesting03',
    appId: '1:102938475610:ios:3b7a9c1e4f6d8e2a',
    messagingSenderId: '102938475610',
    projectId: 'lifelink-dev-platform',
    iosBundleId: 'com.lifelink.app',
  );
}
