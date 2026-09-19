/// All API endpoint constants for the LifeLink FastAPI backend.
/// Base URL is environment-driven; never hardcode production URLs here.
class ApiEndpoints {
  ApiEndpoints._();

  // ── Auth ─────────────────────────────────────────────────
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String register = '/auth/signup';
  static const String signupVerify = '/auth/signup/verify';
  static const String signupResendOtp = '/auth/signup/resend-otp';
  static const String me = '/auth/me';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // ── Users ────────────────────────────────────────────────
  static const String users = '/users';
  static String userById(String id) => '/users/$id';

  // ── Blood Requests ───────────────────────────────────────
  static const String requests = '/requests';
  static String requestById(String id) => '/requests/$id';
  static String acknowledgeRequest(String id) => '/requests/$id/acknowledge';
  static String confirmRequest(String id) => '/requests/$id/confirm';
  static String prepareRequest(String id) => '/requests/$id/prepare';
  static String completeRequest(String id) => '/requests/$id/complete';
  static String cancelRequest(String id) => '/requests/$id/cancel';
  static String issueQr(String id) => '/requests/$id/qr';

  // ── Supporting Documents ─────────────────────────────────
  static String listDocuments(String requestId) =>
      '/requests/$requestId/documents';
  static String uploadDocument(String requestId) =>
      '/requests/$requestId/documents';

  // ── QR / Tracking ────────────────────────────────────────
  static const String qrScan = '/qr/scan';
  static const String qrBagScan = '/caregiver/scan-bag';
  static String qrBag(String qrCode) =>
      '/caregiver/bag/${Uri.encodeComponent(qrCode)}';
  static String tracking(String reference) => '/tracking/$reference';

  // ── Inventory ────────────────────────────────────────────
  static const String inventory = '/inventory';
  static String inventoryById(String id) => '/inventory/$id';

  // ── Notifications ────────────────────────────────────────
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';

  // ── Institutions ─────────────────────────────────────────
  static const String hospitals = '/hospitals';
  static const String bloodBanks = '/blood-banks';

  // ── Donors ───────────────────────────────────────────────
  static const String donorsMe = '/donors/me';
  static String donorById(String id) => '/donors/$id';
  static const String donorDonations = '/donors/me/donations';
  static const String donorNearbyRequests = '/donors/me/nearby-requests';
  static const String donorResponses = '/donors/me/responses';
  static const String donorConsents = '/donors/me/consents';
  static const String donorVouchers = '/donors/me/vouchers';

  // ── Caregiver ────────────────────────────────────────────
  static const String caregiverAssignments = '/caregiver/assignments';
  static const String caregiverPatients = '/caregiver/patients';
  static String caregiverPatientRequests(String patientId) =>
      '/caregiver/patients/$patientId/blood-requests';
  static const String caregiverAllocations = '/caregiver/allocations';
  static const String caregiverPaymentInitiate = '/caregiver/payments/initiate';
  static const String caregiverPaymentHistory = '/caregiver/payments/history';
  static String caregiverMatches(String requestId) =>
      '/requests/$requestId/matching-donors';
  static String caregiverAssignmentById(String id) =>
      '/caregiver/assignments/$id';
  static String caregiverBagDetails(String qrCode) =>
      '/caregiver/bag/${Uri.encodeComponent(qrCode)}';

  // ── Payments ─────────────────────────────────────────────
  static const String payments = '/payments';
  static const String initiatePayment = '/payments/initiate';
  static String paymentById(String id) => '/payments/$id';
  static String paymentsByRequestId(String requestId) =>
      '/payments/request/$requestId';

  // ── Health ───────────────────────────────────────────────
  static const String health = '/health';

  // ── Blood bags ──────────────────────────────────────────
  static const String bloodBags = '/blood-bags';
  static String bloodBagQr(String id) => '/blood-bags/$id/qr';
  static String bloodBagStatus(String id) => '/blood-bags/$id/status';
  static String bloodBagHistory(String id) => '/blood-bags/$id/history';
  static const String caregiverScanBag = '/caregiver/scan-bag';
  static const String bloodBagScan = '/blood-bags/scan';
  static String bloodBagScanHistory(String qrCode) =>
      '/blood-bags/scan/$qrCode/history';

  // ── Push devices ────────────────────────────────────────
  static const String notificationDevices = '/notifications/devices';
}
