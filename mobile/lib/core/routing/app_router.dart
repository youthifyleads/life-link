import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/otp_screen.dart';
import '../../features/auth/presentation/screens/flow_selection_screen.dart';
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
import '../../features/caregiver/presentation/screens/caregiver_requests_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_allocations_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_bag_scan_screen.dart';
import '../../features/caregiver/presentation/screens/caregiver_bag_scan_result_screen.dart';

import '../../features/caregiver/presentation/screens/patient_blood_request_screen.dart';
import '../../features/caregiver/domain/models/caregiver_models.dart';
import '../../features/documents/presentation/bloc/document_bloc.dart';
import '../../features/tracking/presentation/bloc/tracking_bloc.dart';
import '../../features/tracking/presentation/screens/qr_scanner_screen.dart';
import '../../features/tracking/presentation/screens/tracking_details_screen.dart';
import '../../features/tracking/presentation/screens/tracking_lookup_screen.dart';
import '../../features/tracking/domain/models/tracking_model.dart';
import '../../features/notifications/presentation/bloc/notification_bloc.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/donor/presentation/screens/donor_eligibility_screen.dart';
import '../../features/donor/presentation/screens/donor_feed_screen.dart';
import '../../features/donor/presentation/screens/donor_request_details_screen.dart';
import '../../features/donor/presentation/screens/donation_voucher_screen.dart';
import '../../features/donor/presentation/screens/donor_responses_screen.dart';
import '../../features/donor/presentation/screens/donor_consents_screen.dart';
import '../../features/blood_bags/presentation/screens/blood_bags_screen.dart';
import '../../features/blood_bags/presentation/screens/blood_bag_details_screen.dart';
import '../../features/blood_bags/domain/models/blood_bag_models.dart';
import '../../features/blood_bags/presentation/screens/blood_bag_qr_screen.dart';
import '../../features/blood_bags/presentation/screens/blood_bag_scanner_screen.dart';
import '../../features/blood_bags/presentation/screens/blood_bag_scan_result_screen.dart';
import '../../features/donor/presentation/screens/donor_vouchers_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/payments/presentation/screens/payment_screen.dart';
import '../../features/payments/presentation/screens/payment_history_screen.dart';
import '../../features/payments/presentation/bloc/payment_cubit.dart';
import '../../features/payments/data/payment_repository.dart';
import '../di/injection.dart';
import '../widgets/unavailable_feature_screen.dart';

class AppRouter {
  AppRouter._();

  static final navigatorKey = GlobalKey<NavigatorState>();

  static GoRouter createRouter(AuthState authState) {
    return GoRouter(
      navigatorKey: navigatorKey,
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
          final flow = authState.appFlow;
          final isCaregiver = flow == 'caregiver';
          final isDonor = flow == 'donor';
          final isCaregiverRoute = state.uri.path.startsWith('/caregiver') ||
              state.uri.path.startsWith('/qr') ||
              state.uri.path.startsWith('/tracking') ||
              state.uri.path.startsWith('/blood-bags');
          final isDonorRoute = state.uri.path.startsWith('/donor');
          if (isCaregiverRoute && !isCaregiver) {
            return isDonor ? '/donor/home' : null;
          }
          if (isDonorRoute && !isDonor) {
            return isCaregiver ? '/caregiver/home' : '/login';
          }
          if (isAuthRoute) {
            if (isCaregiver) return '/caregiver/home';
            if (isDonor) return '/donor/home';
            return '/select-flow';
          // Users have single account and can access both donor and caregiver modes
          if (isAuthRoute) {
            return '/donor/home';
          }
          return null;
        }
        if (authState is AuthFlowSelectionRequired &&
            !state.uri.path.startsWith('/select-flow')) {
          return '/select-flow';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/select-flow',
          builder: (context, state) => const FlowSelectionScreen(),
        ),
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
              final map = Map<String, dynamic>.from(
                state.extra! as Map<String, dynamic>,
              );
              final email =
                  map['email'] is String ? (map['email'] as String).trim() : '';
              if (email.isEmpty) {
                return const UnavailableFeatureScreen(
                  title: 'OTP verification unavailable',
                  message: 'A valid verification destination is required. '
                      'Please return to sign in and request a new code.',
                );
              }
              return OtpVerificationScreen(
                email: email,
              );
            }
            final email =
                state.extra is String ? (state.extra as String).trim() : '';
            if (email.isEmpty) {
              return const UnavailableFeatureScreen(
                title: 'OTP verification unavailable',
                message: 'A valid verification destination is required. '
                    'Please return to sign in and request a new code.',
              );
            }
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
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Donor Feed',
            message: 'Donor feed is managed from Donor Home.',
          ),
        ),
        GoRoute(
          path: '/donor/request',
          builder: (context, state) {
            final requestId = state.uri.queryParameters['requestId'];
            return requestId == null || requestId.isEmpty
                ? const UnavailableFeatureScreen(
                    title: 'Blood request',
                    message: 'A valid blood request is required.',
                  )
                : DonorRequestDetailsScreen(requestId: requestId);
          },
        ),
        GoRoute(
          path: '/caregiver/requests',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Requests',
            message: 'Caregiver requests are available from the Home screen.',
          ),
        ),
        GoRoute(
          path: '/donor/voucher',
          builder: (context, state) {
            return const DonationVoucherScreen();
          },

          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Donation voucher',
            message: 'Voucher feature is coming soon.',
          ),
        ),
        GoRoute(
          path: '/donor/responses',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Donor Responses',
            message: 'Responses history is coming soon.',
          ),
        ),
        GoRoute(
          path: '/donor/consents',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Donor Consents',
            message: 'Consents feature is coming soon.',
          ),
        ),
        GoRoute(
          path: '/caregiver/blood-bags',
          builder: (context, state) {
            if (authState is! AuthAuthenticated ||
                !(authState is AuthAuthenticated &&
                    authState.appFlow == 'caregiver')) {
              return const UnavailableFeatureScreen(
                title: 'Blood bags',
                message: 'This operation is only available to caregivers.',
              );
            }
            return const BloodBagsScreen();
          },

          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bags',
            message: 'Blood bags are scanned via Caregiver Home.',
          ),
        ),
        GoRoute(
          path: '/blood-bags/details',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bag',
            message: 'Blood bag details are displayed upon scanning.',
          ),
        ),
        GoRoute(
          path: '/caregiver/blood-bags/scan',
          builder: (context, state) {
            if (authState is! AuthAuthenticated ||
                !(authState is AuthAuthenticated &&
                    authState.appFlow == 'caregiver')) {
              return const UnavailableFeatureScreen(
                title: 'Blood bag scanner',
                message: 'This operation is only available to caregivers.',
              );
            }
            return const BloodBagScannerScreen(caregiver: true);
          },
        ),
        GoRoute(
          path: '/donor/blood-bags/scan',
          builder: (context, state) {
            if (authState is! AuthAuthenticated ||
                authState.appFlow != 'caregiver') {
              return const UnavailableFeatureScreen(
                title: 'Blood bag scanner',
                message: 'This operation is not available for this account.',
              );
            }
            return const BloodBagScannerScreen(caregiver: false);
          },
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bag scanner',
            message: 'Scanner is accessible from Caregiver Home.',
          ),
        ),
        GoRoute(
          path: '/donor/blood-bags/scan',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bag scanner',
            message: 'This operation is not available for this account.',
          ),
        ),
        GoRoute(
          path: '/blood-bags/scan-result',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bag',
            message: 'Scan result is displayed on the main screen.',
          ),
        ),
        GoRoute(
          path: '/blood-bags/qr',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Blood bag QR',
            message: 'Blood bag QR is generated hospital-side.',
          ),
        ),
        GoRoute(
          path: '/caregiver/patients',
          builder: (context, state) => authState is AuthAuthenticated &&
                  authState.appFlow == 'caregiver'
              ? const CaregiverPatientsScreen()
              : const UnavailableFeatureScreen(
                  title: 'Patients',
                  message: 'This operation is only available to caregivers.',
                ),
        ),
        GoRoute(
          path: '/caregiver/assignments',
          builder: (context, state) => authState is AuthAuthenticated &&
                  authState.appFlow == 'caregiver'
              ? const CaregiverAssignmentsScreen()
              : const UnavailableFeatureScreen(
                  title: 'Assignments',
                  message: 'This operation is only available to caregivers.',
                ),
          builder: (context, state) => const CaregiverPatientsScreen(),
        ),
        GoRoute(
          path: '/caregiver/assignments',
          builder: (context, state) => const CaregiverAssignmentsScreen(),
        ),
        GoRoute(
          path: '/caregiver/allocations',
          builder: (context, state) =>
              authState is AuthAuthenticated && authState.appFlow == 'caregiver'
                  ? const CaregiverAllocationsScreen()
                  : const UnavailableFeatureScreen(
                      title: 'Allocations',
                      message:
                          'This operation is only available in the caregiver flow.',
                    ),
        ),
        GoRoute(
          path: '/caregiver/patients/request',
          builder: (context, state) => state.extra is PatientModel
              ? PatientBloodRequestScreen(patient: state.extra as PatientModel)
              : const UnavailableFeatureScreen(
                  title: 'Patient request',
                  message: 'A valid patient is required.',
                ),
        ),
        GoRoute(
          path: '/caregiver/matches',
          builder: (context, state) {
            final requestId = state.uri.queryParameters['requestId'];
            if (authState is! AuthAuthenticated ||
                authState.appFlow != 'caregiver' ||
                requestId == null ||
                requestId.isEmpty) {
              return const UnavailableFeatureScreen(
                title: 'Matching',
                message: 'A valid caregiver request is required.',
              );
            }
            return CaregiverMatchesScreen(requestId: requestId);
          },
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
            final request = state.extra;
            if (request is! BloodRequestPublic) {
              return const UnavailableFeatureScreen(
                title: 'Request details',
                message: 'A valid blood request is required.',
              );
            }
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
            final tracking = state.extra;
            return tracking is TrackingPublic
                ? TrackingDetailsScreen(tracking: tracking)
                : const UnavailableFeatureScreen(
                    title: 'Tracking',
                    message: 'Valid tracking data is required.',
                  );
          },
        ),
        GoRoute(
          path: '/tracking/lookup',
          builder: (context, state) {
            final reference = state.extra is String
                ? state.extra as String
                : state.uri.queryParameters['reference'];
            if (reference == null || reference.isEmpty) {
              return const UnavailableFeatureScreen(
                title: 'Tracking',
                message: 'A tracking reference is required.',
              );
            }
            return BlocProvider(
              create: (_) =>
                  getIt<TrackingBloc>()..add(LookupReferenceEvent(reference)),
              child: const TrackingLookupScreen(),
            );
          },
        ),
        GoRoute(
          path: '/caregiver/scan',
          builder: (context, state) => const CaregiverBagScanScreen(),
        ),
        GoRoute(
          path: '/caregiver/scan-result',
          builder: (context, state) {
            final result = state.extra;
            return result is CaregiverBagScanModel
                ? BlocProvider(
                    create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                    child: CaregiverBagScanResultScreen(result: result),
                  )
                : const UnavailableFeatureScreen(
                    title: 'Scan Result',
                    message: 'Valid caregiver scan data is required.',
                  );
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
          path: '/settings',
          builder: (context, state) => const UnavailableFeatureScreen(
            title: 'Settings',
            message: 'Settings are coming soon.',
          ),
        ),
        GoRoute(
          path: '/donor/eligibility',
          builder: (context, state) => const DonorEligibilityScreen(),
        ),
        GoRoute(
          path: '/donor/vouchers',
          builder: (context, state) => const DonorVouchersScreen(),
        ),

        // ── Payment ───────────────────────────────────────────────
        GoRoute(
          path: '/caregiver/payment',
          builder: (context, state) {
            final extra = state.extra;
            if (extra is BloodRequestPublic) {
              return BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(request: extra),
              );
            }
            if (extra is TrackingPublic && extra.requestId != null) {
              return BlocProvider(
                create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                child: PaymentScreen(
                  request: BloodRequestPublic(
                    id: extra.requestId!,
                    hospitalId: '',
                    bloodType: extra.bloodType,
                    component: extra.component,
                    quantityUnits: extra.quantity,
                    urgency: false,
                    status: extra.status,
                    trackingReference: extra.reference,
                    createdAt: extra.lastUpdated,
                  ),
                ),
              );
            }
            if (extra is String) {
              return BlocProvider(
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
            }
            return const UnavailableFeatureScreen(
              title: 'Payment',
              message: 'A valid blood request is required.',
            );
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
          path: '/caregiver/payment/allocation',
          builder: (context, state) {
            final allocationId = state.extra is String
                ? state.extra as String
                : state.uri.queryParameters['allocationId'];
            return allocationId == null || allocationId.isEmpty
                ? const UnavailableFeatureScreen(
                    title: 'Payment',
                    message: 'An allocation is required.',
                  )
                : BlocProvider(
                    create: (_) => PaymentCubit(getIt<PaymentRepository>()),
                    child: PaymentScreen(allocationId: allocationId),
                  );
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
