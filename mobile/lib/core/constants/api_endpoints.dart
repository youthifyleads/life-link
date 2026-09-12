/// All API endpoint constants for the LifeLink FastAPI backend.
/// Base URL is environment-driven; never hardcode production URLs here.
class ApiEndpoints {
  ApiEndpoints._();

  // ── Auth ─────────────────────────────────────────────────
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String otpRequest = '/auth/otp/request';
  static const String otpVerify = '/auth/otp/verify';

  // ── Users ────────────────────────────────────────────────
  static const String users = '/users';
  static const String myUserProfile = '/users/me';
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
  static const String donorResponses = '/donors/me/responses';
  static const String donorConsents = '/donors/me/consents';

  // ── Caregiver ────────────────────────────────────────────
  static const String caregiverAssignments = '/caregiver/assignments';
  static const String caregiverPatients = '/caregiver/patients';
  static String caregiverMatches(String requestId) =>
      '/caregiver/matches/$requestId';
  static String caregiverAssignmentById(String id) =>
      '/caregiver/assignments/$id';

  // ── Payments ─────────────────────────────────────────────
  static const String payments = '/payments';
  static String paymentById(String id) => '/payments/$id';
  static String paymentsByRequestId(String requestId) =>
      '/payments/request/$requestId';

  // ── Health ───────────────────────────────────────────────
  static const String health = '/health';
}
