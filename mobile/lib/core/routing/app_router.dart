import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/domain/models/user_model.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/otp_screen.dart';
import '../../features/donor/presentation/screens/donor_home_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_home_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_assignments_screen.dart';
import '../../features/help/presentation/screens/help_screen.dart';
import '../../features/blood_requests/presentation/screens/create_blood_request_screen.dart';
import '../../features/blood_requests/presentation/bloc/blood_request_bloc.dart';
import '../../features/blood_requests/domain/models/blood_request_model.dart';
import '../../features/caregiver/presentation/screens/request_details_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_patients_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_matches_screen.dart';
import '../../features/caregiver/presentation/screens/patient_blood_request_screen.dart';
import '../../features/caregiver/domain/models/caregiver_models.dart';
import '../../features/documents/presentation/bloc/document_bloc.dart';
import '../../features/tracking/presentation/bloc/tracking_bloc.dart';
import '../../features/tracking/presentation/screens/qr_scanner_screen.dart';
import '../../features/tracking/presentation/screens/tracking_details_screen.dart';
import '../../features/tracking/presentation/screens/delivery_route_map_screen.dart';
import '../../features/tracking/domain/models/tracking_model.dart';
import '../../features/notifications/presentation/bloc/notification_bloc.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/donor/presentation/screens/donor_eligibility_screen.dart';
import '../../features/donor/presentation/screens/donor_vouchers_screen.dart';
import '../../features/donor/presentation/screens/donor_urgent_alerts_screen.dart';
import '../../features/donor/presentation/screens/donor_campaigns_screen.dart';
import '../../features/donor/presentation/screens/hospital_location_screen.dart';
import '../../features/donor/presentation/screens/donation_request_screen.dart';
import '../../features/donor/presentation/screens/donation_guide_screen.dart';
import '../../features/donor/presentation/screens/medical_screening_quiz_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/payments/presentation/screens/payment_screen.dart';
import '../../features/payments/presentation/screens/payment_history_screen.dart';
import '../../features/payments/presentation/bloc/payment_cubit.dart';
import '../../features/payments/data/payment_repository.dart';
import '../di/injection.dart';
import '../widgets/unavailable_feature_screen.dart';

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
      (dynamic _) => notifyListeners(),
    );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

class AppRouter {
  AppRouter._();

  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  static GoRouter? _routerInstance;
  static AuthBloc? _boundAuthBloc;

  /// Optimized single-instance router using [refreshListenable] to re-evaluate
  /// redirects without discarding navigator state or tearing down screens.
  static GoRouter getRouter(AuthBloc authBloc) {
    if (_routerInstance != null && identical(_boundAuthBloc, authBloc)) {
      return _routerInstance!;
    }
    _boundAuthBloc = authBloc;
    _routerInstance = _buildRouter(authBloc);
    return _routerInstance!;
  }

  /// Backward-compatible router accessor.
  static GoRouter createRouter([dynamic auth]) {
    if (auth is AuthBloc) {
      return getRouter(auth);
    }
    return getRouter(getIt<AuthBloc>());
  }

  static CustomTransitionPage<T> _buildSmoothPage<T>({
    required BuildContext context,
    required GoRouterState state,
    required Widget child,
  }) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 260),
      reverseTransitionDuration: const Duration(milliseconds: 220),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
          reverseCurve: Curves.easeInCubic,
        );
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.04, 0.0),
            end: Offset.zero,
          ).animate(curvedAnimation),
          child: FadeTransition(
            opacity: curvedAnimation,
            child: child,
          ),
        );
      },
    );
  }

  static GoRouter _buildRouter(AuthBloc authBloc) {
    return GoRouter(
      navigatorKey: navigatorKey,
      initialLocation: '/login',
      refreshListenable: GoRouterRefreshStream(authBloc.stream),
      errorBuilder: (context, state) => Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.location_off_outlined,
                  size: 64, color: Colors.red),
              const SizedBox(height: 16),
              const Text(
                'الصفحة أو المسار غير موجود',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => context.go('/login'),
                icon: const Icon(Icons.home),
                label: const Text('العودة للرئيسية'),
              ),
            ],
          ),
        ),
      ),
      redirect: (context, state) {
        final authState = authBloc.state;
        final isAuthRoute = state.uri.path.startsWith('/login') ||
            state.uri.path.startsWith('/register') ||
            state.uri.path.startsWith('/forgot-password') ||
            state.uri.path.startsWith('/otp');

        // Initial Loading state
        if (authState is AuthInitial || authState is AuthLoading) {
          return null;
        }

        if (authState is AuthUnauthenticated) {
          return isAuthRoute ? null : '/login';
        }

        if (authState is AuthAuthenticated) {
          // Users have single account and can access both donor and caregiver modes
          if (isAuthRoute) {
            return '/donor/home';
          }
          return null;
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const LoginScreen(),
          ),
        ),
        GoRoute(
          path: '/register',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const RegisterScreen(),
          ),
        ),
        GoRoute(
          path: '/forgot-password',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const ForgotPasswordScreen(),
          ),
        ),
        GoRoute(
          path: '/otp',
          pageBuilder: (context, state) {
            Widget child;
            if (state.extra is Map<String, dynamic>) {
              final map = Map<String, dynamic>.from(
                state.extra! as Map<String, dynamic>,
              );
              final email =
                  map['email'] is String ? (map['email'] as String).trim() : '';
              if (email.isEmpty) {
                child = const UnavailableFeatureScreen(
                  title: 'OTP verification unavailable',
                  message: 'A valid verification destination is required. '
                      'Please return to sign in and request a new code.',
                );
              } else {
                child = OtpVerificationScreen(
                  email: email,
                  isRegistration: map['isRegistration'] is bool
                      ? map['isRegistration'] as bool
                      : false,
                  pendingUserData: map['pendingUserData'] is Map
                      ? Map<String, dynamic>.from(map['pendingUserData'] as Map)
                      : null,
                  challengeId: map['challengeId'] is String
                      ? map['challengeId'] as String
                      : null,
                );
              }
            } else {
              final email =
                  state.extra is String ? (state.extra as String).trim() : '';
              if (email.isEmpty) {
                child = const UnavailableFeatureScreen(
                  title: 'OTP verification unavailable',
                  message: 'A valid verification destination is required. '
                      'Please return to sign in and request a new code.',
                );
              } else {
                child = OtpVerificationScreen(email: email);
              }
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/donor/home',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonorHomeScreen(),
          ),
        ),
        GoRoute(
          path: '/caregiver/home',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const CaregiverHomeScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/feed',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonorUrgentAlertsScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/campaigns',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonorCampaignsScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/location',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: HospitalLocationScreen(
              hospitalData: state.extra is Map<String, dynamic>
                  ? state.extra as Map<String, dynamic>
                  : null,
            ),
          ),
        ),
        GoRoute(
          path: '/donor/request-details',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: DonationRequestScreen(
              requestData: state.extra is Map<String, dynamic>
                  ? state.extra as Map<String, dynamic>
                  : null,
            ),
          ),
        ),
        GoRoute(
          path: '/caregiver/requests',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Requests',
              message: 'Caregiver requests are available from the Home screen.',
            ),
          ),
        ),
        GoRoute(
          path: '/donor/voucher',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Donation voucher',
              message: 'Voucher feature is coming soon.',
            ),
          ),
        ),
        GoRoute(
          path: '/donor/responses',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Donor Responses',
              message: 'Responses history is coming soon.',
            ),
          ),
        ),
        GoRoute(
          path: '/donor/consents',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Donor Consents',
              message: 'Consents feature is coming soon.',
            ),
          ),
        ),
        GoRoute(
          path: '/caregiver/blood-bags',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bags',
              message: 'Blood bags are scanned via Caregiver Home.',
            ),
          ),
        ),
        GoRoute(
          path: '/blood-bags/details',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bag',
              message: 'Blood bag details are displayed upon scanning.',
            ),
          ),
        ),
        GoRoute(
          path: '/caregiver/blood-bags/scan',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bag scanner',
              message: 'Scanner is accessible from Caregiver Home.',
            ),
          ),
        ),
        GoRoute(
          path: '/donor/blood-bags/scan',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bag scanner',
              message: 'This operation is not available for this account.',
            ),
          ),
        ),
        GoRoute(
          path: '/blood-bags/scan-result',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bag',
              message: 'Scan result is displayed on the main screen.',
            ),
          ),
        ),
        GoRoute(
          path: '/blood-bags/qr',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const UnavailableFeatureScreen(
              title: 'Blood bag QR',
              message: 'Blood bag QR is generated hospital-side.',
            ),
          ),
        ),
        GoRoute(
          path: '/caregiver/patients',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const CaregiverPatientsScreen(),
          ),
        ),
        GoRoute(
          path: '/caregiver/assignments',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const CaregiverAssignmentsScreen(),
          ),
        ),
        GoRoute(
          path: '/caregiver/patients/request',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: state.extra is PatientModel
                ? PatientBloodRequestScreen(patient: state.extra as PatientModel)
                : const UnavailableFeatureScreen(
                    title: 'Patient request',
                    message: 'A valid patient is required.',
                  ),
          ),
        ),
        GoRoute(
          path: '/caregiver/matches',
          pageBuilder: (context, state) {
            final requestId = state.uri.queryParameters['requestId'];
            Widget child;
            final currentAuth = authBloc.state;
            if (currentAuth is! AuthAuthenticated ||
                !currentAuth.user.role.isCaregiver ||
                requestId == null ||
                requestId.isEmpty) {
              child = const UnavailableFeatureScreen(
                title: 'Matching',
                message: 'A valid caregiver request is required.',
              );
            } else {
              child = CaregiverMatchesScreen(requestId: requestId);
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/caregiver/create-request',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: BlocProvider(
              create: (_) => getIt<BloodRequestBloc>(),
              child: const CreateBloodRequestScreen(),
            ),
          ),
        ),
        GoRoute(
          path: '/caregiver/request/details',
          pageBuilder: (context, state) {
            final request = state.extra;
            Widget child;
            if (request is! BloodRequestPublic) {
              child = const UnavailableFeatureScreen(
                title: 'Request details',
                message: 'A valid blood request is required.',
              );
            } else {
              child = BlocProvider(
                create: (_) => getIt<DocumentBloc>(),
                child: RequestDetailsScreen(request: request),
              );
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const Scaffold(
              body: Center(child: Text('Web Portal Roles unsupported in Mobile')),
            ),
          ),
        ),

        // ── QR Tracking ──────────────────────────────────────────
        GoRoute(
          path: '/qr/scan',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: BlocProvider(
              create: (_) => getIt<TrackingBloc>(),
              child: const QrScannerScreen(),
            ),
          ),
        ),
        GoRoute(
          path: '/tracking',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: DeliveryRouteMapScreen(
              requestId: state.extra is String ? state.extra as String : null,
            ),
          ),
        ),
        GoRoute(
          path: '/tracking/details',
          pageBuilder: (context, state) {
            final tracking = state.extra;
            final child = tracking is TrackingPublic
                ? TrackingDetailsScreen(tracking: tracking)
                : const UnavailableFeatureScreen(
                    title: 'Tracking',
                    message: 'Valid tracking data is required.',
                  );
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),

        // ── Notifications ─────────────────────────────────────────
        GoRoute(
          path: '/notifications',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: BlocProvider(
              create: (_) =>
                  getIt<NotificationBloc>()..add(LoadNotificationsEvent()),
              child: const NotificationsScreen(),
            ),
          ),
        ),

        // ── Profile & Eligibility ─────────────────────────────────
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const ProfileScreen(),
          ),
        ),
        GoRoute(
          path: '/settings',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const ProfileScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/eligibility',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonorEligibilityScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/vouchers',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonorVouchersScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/guide',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const DonationGuideScreen(),
          ),
        ),
        GoRoute(
          path: '/donor/medical-quiz',
          pageBuilder: (context, state) {
            final extra = state.extra;
            final onEligible = extra is VoidCallback ? extra : null;
            return _buildSmoothPage(
              context: context,
              state: state,
              child: MedicalScreeningQuizScreen(
                onEligibleProceed: onEligible,
              ),
            );
          },
        ),

        // ── Payment ───────────────────────────────────────────────
        GoRoute(
          path: '/caregiver/payment',
          pageBuilder: (context, state) {
            final extra = state.extra;
            Widget child;
            if (extra is BloodRequestPublic) {
              child = BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(request: extra),
              );
            } else if (extra is TrackingPublic) {
              child = BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(
                  request: BloodRequestPublic(
                    id: extra.requestId ?? extra.reference,
                    hospitalId: '',
                    bloodType: extra.bloodType,
                    component: extra.component,
                    quantityUnits: extra.quantity,
                    urgency: false,
                    status: extra.status,
                    trackingReference: extra.reference,
                    createdAt: extra.lastUpdated,
                  ),
                  initialAmount: extra.totalPrice,
                  hospitalOrBankName: extra.bankName,
                ),
              );
            } else if (extra is String) {
              child = BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(
                  request: BloodRequestPublic(
                    id: extra,
                    hospitalId: '',
                    bloodType: '',
                    component: 'whole_blood',
                    quantityUnits: 1,
                    urgency: false,
                    status: 'requested',
                    trackingReference: extra,
                    createdAt: DateTime.now(),
                  ),
                ),
              );
            } else {
              child = const UnavailableFeatureScreen(
                title: 'Payment',
                message: 'A valid blood request is required.',
              );
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/caregiver/payment-history',
          pageBuilder: (context, state) {
            final extra = state.extra;
            Widget child;
            if (extra is BloodRequestPublic) {
              child = PaymentHistoryScreen(request: extra);
            } else if (extra is String) {
              child = PaymentHistoryScreen(requestId: extra);
            } else {
              child = const PaymentHistoryScreen();
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/caregiver/payment/allocation',
          pageBuilder: (context, state) {
            final allocationId = state.extra is String
                ? state.extra as String
                : state.uri.queryParameters['allocationId'];
            Widget child;
            if (allocationId == null || allocationId.isEmpty) {
              child = const UnavailableFeatureScreen(
                title: 'Payment',
                message: 'An allocation is required.',
              );
            } else {
              child = BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(allocationId: allocationId),
              );
            }
            return _buildSmoothPage(
              context: context,
              state: state,
              child: child,
            );
          },
        ),
        GoRoute(
          path: '/help/donor',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const HelpScreen(role: 'donor'),
          ),
        ),
        GoRoute(
          path: '/help/caregiver',
          pageBuilder: (context, state) => _buildSmoothPage(
            context: context,
            state: state,
            child: const HelpScreen(role: 'caregiver'),
          ),
        ),
      ],
    );
  }
}
