import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:lifelink_mobile/core/theme/app_theme.dart';
import 'package:lifelink_mobile/core/routing/app_router.dart';
import 'package:lifelink_mobile/core/widgets/lifelink_animations.dart';
import 'package:lifelink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

class MockAuthBloc extends Mock implements AuthBloc {}

void main() {
  group('Performance Optimizations', () {
    test('AppTheme.light() returns identical cached ThemeData instance across calls', () {
      final theme1 = AppTheme.light();
      final theme2 = AppTheme.light();

      expect(identical(theme1, theme2), isTrue,
          reason: 'ThemeData should be cached statically to prevent allocations on rebuilds');
    });

    test('AppRouter.getRouter returns persistent instance for the same AuthBloc', () {
      final mockAuthBloc = MockAuthBloc();
      when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());

      final router1 = AppRouter.getRouter(mockAuthBloc);
      final router2 = AppRouter.getRouter(mockAuthBloc);

      expect(identical(router1, router2), isTrue,
          reason: 'GoRouter must not be re-instantiated on every state update');
    });

    testWidgets('LifeLinkFadeSlide sheds Opacity and Transform layers once animation settles',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LifeLinkFadeSlide(
              duration: Duration(milliseconds: 100),
              child: Text('Performance Target'),
            ),
          ),
        ),
      );

      final slideFinder = find.byType(LifeLinkFadeSlide);

      // During animation entrance, Opacity and Transform are present inside the slide widget
      expect(find.descendant(of: slideFinder, matching: find.byType(Opacity)), findsOneWidget);
      expect(find.descendant(of: slideFinder, matching: find.byType(Transform)), findsOneWidget);

      // Settle past the 100ms duration
      await tester.pump(const Duration(milliseconds: 150));
      await tester.pumpAndSettle();

      // After settling, Opacity and Transform are discarded from the slide widget to eliminate GPU compositing overhead
      expect(find.descendant(of: slideFinder, matching: find.byType(Opacity)), findsNothing);
      expect(find.descendant(of: slideFinder, matching: find.byType(Transform)), findsNothing);
      expect(find.text('Performance Target'), findsOneWidget);
    });

    testWidgets('LifeLinkHeartbeat isolates repeating pulse inside RepaintBoundary',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LifeLinkHeartbeat(
              isPulsing: true,
              child: Text('Clinical Heartbeat'),
            ),
          ),
        ),
      );

      expect(find.byType(RepaintBoundary), findsWidgets);
      expect(find.text('Clinical Heartbeat'), findsOneWidget);
    });
  });
}
