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
import '../../features/donor/presentation/screens/donor_dashboard_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_home_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_dashboard_screen.dart';
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
import '../../features/tracking/domain/models/tracking_model.dart';
import '../../features/notifications/presentation/bloc/notification_bloc.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/donor/presentation/screens/donor_eligibility_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/payments/presentation/screens/payment_screen.dart';
import '../../features/payments/presentation/screens/payment_history_screen.dart';
import '../di/injection.dart';

class AppRouter {
  AppRouter._();

  static GoRouter createRouter(AuthState authState) {
    return GoRouter(
      initialLocation: '/login',
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
          if (state.uri.path.startsWith('/qr') &&
              !authState.user.role.isCaregiver) {
            return '/donor/home';
          }
          if (isAuthRoute) {
            final role = authState.user.role;
            if (role.apiValue == 'donor' ||
                role.apiValue == 'platform_support' ||
                role.apiValue == 'normal_user') {
              return '/donor/home';
            }
            if (role.apiValue == 'caregiver') return '/caregiver/home';
            return '/donor/home'; // fallback for mobile view
          }
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/forgot-password',
          builder: (context, state) => const ForgotPasswordScreen(),
        ),
        GoRoute(
          path: '/otp',
          builder: (context, state) {
            if (state.extra is Map<String, dynamic>) {
              final map = state.extra as Map<String, dynamic>;
              return OtpVerificationScreen(
                email: map['email'] as String? ?? '',
                phone: map['phone'] as String?,
                isRegistration: map['isRegistration'] as bool? ?? false,
                pendingUserData:
                    map['pendingUserData'] as Map<String, dynamic>?,
                challengeId: map['challengeId'] as String?,
              );
            }
            final email = state.extra as String? ?? '';
            return OtpVerificationScreen(email: email);
          },
        ),
        GoRoute(
          path: '/donor/home',
          builder: (context, state) => const DonorHomeScreen(),
        ),
        GoRoute(
          path: '/caregiver/home',
          builder: (context, state) => const CaregiverHomeScreen(),
        ),
        GoRoute(
          path: '/donor/feed',
          builder: (context, state) => const DonationFeedScreen(),
        ),
        GoRoute(
          path: '/caregiver/requests',
          builder: (context, state) => const CaregiverRequestsScreen(),
        ),
        GoRoute(
          path: '/caregiver/patients',
          builder: (context, state) => const CaregiverPatientsScreen(),
        ),
        GoRoute(
          path: '/caregiver/assignments',
          builder: (context, state) => const CaregiverAssignmentsScreen(),
        ),
        GoRoute(
          path: '/caregiver/patients/request',
          builder: (context, state) => PatientBloodRequestScreen(
            patient: state.extra as PatientModel,
          ),
        ),
        GoRoute(
          path: '/caregiver/matches',
          builder: (context, state) => CaregiverMatchesScreen(
            requestId: state.uri.queryParameters['requestId'] ?? '',
          ),
        ),
        GoRoute(
          path: '/caregiver/create-request',
          builder: (context, state) => BlocProvider(
            create: (_) => getIt<BloodRequestBloc>(),
            child: const CreateBloodRequestScreen(),
          ),
        ),
        GoRoute(
          path: '/caregiver/request/details',
          builder: (context, state) {
            final request = state.extra as BloodRequestPublic;
            return BlocProvider(
              create: (_) => getIt<DocumentBloc>(),
              child: RequestDetailsScreen(request: request),
            );
          },
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const Scaffold(
            body: Center(child: Text('Web Portal Roles unsupported in Mobile')),
          ),
        ),

        // ── QR Tracking ──────────────────────────────────────────
        GoRoute(
          path: '/qr/scan',
          builder: (context, state) => BlocProvider(
            create: (_) => getIt<TrackingBloc>(),
            child: const QrScannerScreen(),
          ),
        ),
        GoRoute(
          path: '/tracking/details',
          builder: (context, state) {
            final tracking = state.extra as TrackingPublic;
            return TrackingDetailsScreen(tracking: tracking);
          },
        ),

        // ── Notifications ─────────────────────────────────────────
        GoRoute(
          path: '/notifications',
          builder: (context, state) => BlocProvider(
            create: (_) =>
                getIt<NotificationBloc>()..add(LoadNotificationsEvent()),
            child: const NotificationsScreen(),
          ),
        ),

        // ── Profile & Eligibility ─────────────────────────────────
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/donor/eligibility',
          builder: (context, state) => const DonorEligibilityScreen(),
        ),

        // ── Payment ───────────────────────────────────────────────
        GoRoute(
          path: '/caregiver/payment',
          builder: (context, state) {
            final request = state.extra as BloodRequestPublic;
            return PaymentScreen(request: request);
          },
        ),
        GoRoute(
          path: '/caregiver/payment-history',
          builder: (context, state) {
            final extra = state.extra;
            if (extra is BloodRequestPublic) {
              return PaymentHistoryScreen(request: extra);
            }
            if (extra is String) {
              return PaymentHistoryScreen(requestId: extra);
            }
            return const PaymentHistoryScreen();
          },
        ),
        GoRoute(
          path: '/help/donor',
          builder: (context, state) => const HelpScreen(role: 'donor'),
        ),
        GoRoute(
          path: '/help/caregiver',
          builder: (context, state) => const HelpScreen(role: 'caregiver'),
        ),
      ],
    );
  }
}
