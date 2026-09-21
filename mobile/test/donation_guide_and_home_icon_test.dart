import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:lifelink_mobile/core/localization/locale_cubit.dart';
import 'package:lifelink_mobile/core/widgets/lifelink_app_bar.dart';
import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:lifelink_mobile/features/donor/presentation/screens/donation_guide_screen.dart';
import 'package:lifelink_mobile/features/donor/presentation/screens/medical_screening_quiz_screen.dart';

class MockStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late MockStorage storage;
  late LocaleCubit localeCubit;

  setUp(() {
    storage = MockStorage();
    when(() => storage.read(key: any(named: 'key'))).thenAnswer((_) async => 'ar');
    when(() => storage.write(key: any(named: 'key'), value: any(named: 'value'))).thenAnswer((_) async {});
    localeCubit = LocaleCubit(storage);
  });

  testWidgets('LifeLinkHomeHeader displays Guide icon button and calls onGuideTap', (tester) async {
    bool tapped = false;

    await tester.pumpWidget(
      BlocProvider<LocaleCubit>.value(
        value: localeCubit,
        child: MaterialApp(
          home: Scaffold(
            body: LifeLinkHomeHeader(
              greeting: 'صباح الخير',
              userName: 'أحمد علي',
              onGuideTap: () => tapped = true,
            ),
          ),
        ),
      ),
    );

    // Verify the Guide icon is rendered
    final guideIconFinder = find.byIcon(Icons.menu_book_rounded);
    expect(guideIconFinder, findsOneWidget);

    // Tap the Guide icon button
    await tester.tap(guideIconFinder);
    await tester.pumpAndSettle();

    expect(tapped, isTrue);
  });

  testWidgets('DonationGuideScreen renders official header, 4 tabs and Egyptian criteria', (tester) async {
    await tester.pumpWidget(
      BlocProvider<LocaleCubit>.value(
        value: localeCubit,
        child: const MaterialApp(
          home: DonationGuideScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Verify tabs
    expect(find.text('المعايير المصرية'), findsOneWidget);
    expect(find.text('فترات الحظر والأسباب'), findsOneWidget);
    expect(find.text('دليل التغذية'), findsOneWidget);
    expect(find.text('الأسئلة الشائعة'), findsOneWidget);

    // Verify 4 Egyptian core metric badges
    expect(find.text('14 رقماً'), findsOneWidget);
    expect(find.text('60+ كجم'), findsOneWidget);
    expect(find.text('ذكور 18-60 • إناث 18-40'), findsOneWidget);
    expect(find.text('فحص رباعي'), findsOneWidget);

    // Verify CTA button is removed as requested
    expect(find.text('ابدأ الفحص الطبي السريع (دقيقة واحدة)'), findsNothing);

    // Verify 'معتمد 🇪🇬' tag is removed
    expect(find.text('معتمد 🇪🇬'), findsNothing);
  });

  testWidgets('MedicalScreeningQuizScreen differentiates male vs female age limits and defers females > 40', (tester) async {
    final fakeDataSource = _FakeAuthRemoteDataSource();
    final authBloc = AuthBloc(fakeDataSource);

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider<LocaleCubit>.value(value: localeCubit),
          BlocProvider<AuthBloc>.value(value: authBloc),
        ],
        child: const MaterialApp(
          home: MedicalScreeningQuizScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Defaults to male: question 3 should ask 18-60
    expect(find.text('3. هل عمرك بين 18 و 60 عاماً؟'), findsOneWidget);

    // Switch to female
    await tester.tap(find.text('أنثى'));
    await tester.pumpAndSettle();

    // Now question 3 should ask 18-40
    expect(find.text('3. هل عمرك بين 18 و 40 عاماً؟'), findsOneWidget);

    // Answer weight: Yes (60+ kg)
    await tester.tap(find.text('نعم (60 كجم فأكثر)'));
    await tester.pumpAndSettle();

    // Answer age: No (>40 or <18)
    await tester.tap(find.text('لا (فوق 40 أو تحت 18)'));
    await tester.pumpAndSettle();

    // Scroll until Next button is visible and click Next
    await tester.ensureVisible(find.text('التالي'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('التالي'));
    await tester.pumpAndSettle();

    // Verify ineligibility screen due to age > 40 for females
    expect(find.text('للأسف، لا يمكنك التبرع حالياً'), findsOneWidget);
    expect(find.textContaining('تجاوز سن الأربعين للإناث'), findsOneWidget);
  });
}

class _FakeAuthRemoteDataSource extends AuthRemoteDataSource {
  _FakeAuthRemoteDataSource() : super(Dio(), const FlutterSecureStorage());
}

