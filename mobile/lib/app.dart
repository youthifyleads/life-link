import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';

import 'core/di/injection.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/locale_cubit.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

class LifeLinkApp extends StatefulWidget {
  const LifeLinkApp({super.key});

  @override
  State<LifeLinkApp> createState() => _LifeLinkAppState();
}

class _LifeLinkAppState extends State<LifeLinkApp> {
  late final AuthBloc _authBloc;
  late final LocaleCubit _localeCubit;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _authBloc = getIt<AuthBloc>()..add(AuthCheckSessionEvent());
    _localeCubit = getIt<LocaleCubit>();
    _router = AppRouter.getRouter(_authBloc);
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _authBloc),
        BlocProvider.value(value: _localeCubit),
      ],
      child: BlocBuilder<LocaleCubit, Locale>(
        buildWhen: (previous, current) => previous != current,
        builder: (context, currentLocale) {
          final isArabic = currentLocale.languageCode == 'ar';
          return MaterialApp.router(
            title: 'LifeLink',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            routerConfig: _router,
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
  }
}

