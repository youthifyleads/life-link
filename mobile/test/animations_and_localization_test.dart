import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:lifelink_mobile/core/localization/app_strings.dart';
import 'package:lifelink_mobile/core/localization/locale_cubit.dart';
import 'package:lifelink_mobile/core/widgets/lifelink_animations.dart';
import 'package:lifelink_mobile/core/widgets/lifelink_button.dart';

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  group('Localization and AppStrings', () {
    test('AppStrings contains matching translations for keys in ar and en', () {
      expect(AppStrings.get('nav_home', locale: 'ar'), 'الرئيسية');
      expect(AppStrings.get('nav_home', locale: 'en'), 'Home');
      expect(AppStrings.get('role_donor', locale: 'ar'), 'أنا متبرع بالدم');
      expect(AppStrings.get('role_donor', locale: 'en'), 'I am a Donor');
      expect(AppStrings.get('role_caregiver', locale: 'ar'), 'أنا مرافق مريض');
      expect(AppStrings.get('role_caregiver', locale: 'en'), 'I am a Caregiver');
      expect(AppStrings.get('route_screen_title', locale: 'ar'), 'مسار وتتبع الشحنة');
      expect(AppStrings.get('route_screen_title', locale: 'en'), 'Shipment Route & Tracking');
    });

    test('LocaleCubit toggles locale correctly', () async {
      final storage = MockFlutterSecureStorage();
      when(() => storage.read(key: any(named: 'key'))).thenAnswer((_) async => 'ar');
      when(() => storage.write(key: any(named: 'key'), value: any(named: 'value'))).thenAnswer((_) async {});

      final cubit = LocaleCubit(storage);
      expect(cubit.state.languageCode, 'ar');
      expect(cubit.isArabic, isTrue);

      await cubit.changeLocale('en');
      expect(cubit.state.languageCode, 'en');
      expect(cubit.isArabic, isFalse);

      await cubit.toggleLocale();
      expect(cubit.state.languageCode, 'ar');
      expect(cubit.isArabic, isTrue);
    });
  });

  group('Motion Primitives & Animations', () {
    testWidgets('LifeLinkFadeSlide renders and transitions child smoothly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LifeLinkFadeSlide(
              duration: Duration(milliseconds: 300),
              child: Text('Animated Card'),
            ),
          ),
        ),
      );

      expect(find.text('Animated Card'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 150));
      expect(find.text('Animated Card'), findsOneWidget);
      await tester.pumpAndSettle();
      expect(find.text('Animated Card'), findsOneWidget);
    });

    testWidgets('LifeLinkHeartbeat renders and pulses without exception', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LifeLinkHeartbeat(
              enabled: true,
              child: Text('Urgent Heartbeat'),
            ),
          ),
        ),
      );

      expect(find.text('Urgent Heartbeat'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Urgent Heartbeat'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 900));
      expect(find.text('Urgent Heartbeat'), findsOneWidget);
    });

    testWidgets('LifeLinkPressable reacts to pointer down and up events', (tester) async {
      bool tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LifeLinkPressable(
              onTap: () => tapped = true,
              child: const Text('Tap Me'),
            ),
          ),
        ),
      );

      expect(find.text('Tap Me'), findsOneWidget);
      final gesture = await tester.startGesture(tester.getCenter(find.text('Tap Me')));
      await tester.pump(const Duration(milliseconds: 60));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('LifeLinkButton transitions color and reacts to press', (tester) async {
      bool buttonPressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LifeLinkButton(
              label: 'تأكيد الموعد',
              onPressed: () => buttonPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('تأكيد الموعد'), findsOneWidget);
      final gesture = await tester.startGesture(tester.getCenter(find.text('تأكيد الموعد')));
      await tester.pump(const Duration(milliseconds: 80));
      // In pressed state
      expect(find.byType(AnimatedContainer), findsWidgets);
      await gesture.up();
      await tester.pumpAndSettle();

      expect(buttonPressed, isTrue);
    });
  });
}
