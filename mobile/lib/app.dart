import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:dio/dio.dart';

import 'core/di/injection.dart';
import 'core/notifications/fcm_service.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/locale_cubit.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

class LifeLinkApp extends StatelessWidget {
  const LifeLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => getIt<AuthBloc>()..add(AuthCheckSessionEvent()),
        ),
        BlocProvider(
          create: (_) => getIt<LocaleCubit>(),
        ),
      ],
      child: BlocBuilder<LocaleCubit, Locale>(
        builder: (context, currentLocale) {
          return BlocListener<AuthBloc, AuthState>(
            listenWhen: (previous, current) =>
                current is AuthAuthenticated && previous is! AuthAuthenticated,
            listener: (context, state) {
              if (state is! AuthAuthenticated) return;
              FcmService.registerDevice(getIt<Dio>()).catchError((error) {
                debugPrint(
                    'Push notification registration unavailable: $error');
                return false;
              });
            },
            child: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, authState) {
                return MaterialApp.router(
                  title: 'LifeLink',
                  debugShowCheckedModeBanner: false,
                  theme: AppTheme.light(),
                  routerConfig: AppRouter.createRouter(authState),
                  locale: currentLocale,
                  supportedLocales: const [
                    Locale('ar'),
                    Locale('en'),
                  ],
                  localizationsDelegates: const [
                    GlobalMaterialLocalizations.delegate,
                    GlobalWidgetsLocalizations.delegate,
                    GlobalCupertinoLocalizations.delegate,
                  ],
                  builder: (context, child) {
                    final isArabic = currentLocale.languageCode == 'ar';
                    return Directionality(
                      textDirection:
                          isArabic ? TextDirection.rtl : TextDirection.ltr,
                      child: child ?? const SizedBox.shrink(),
                    );
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
