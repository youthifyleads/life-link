import 'package:dio/dio.dart';

import '../domain/models/donor_profile_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class DonorRemoteDataSource {
  final Dio _dio;

  DonorRemoteDataSource(this._dio);

  /// GET /api/v1/donors/me
  Future<DonorProfileModel> getProfile() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorsMe);
      return DonorProfileModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/donors/me/donations
  Future<List<DonationHistoryItem>> getDonationHistory() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorDonations);
      final List data = response.data as List;
      return data
          .map((item) =>
              DonationHistoryItem.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/donors/me/nearby-requests
  Future<List<NearbyBloodRequest>> getNearbyRequests() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorNearbyRequests);
      final data = response.data as List;
      return data
          .map((item) =>
              NearbyBloodRequest.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  Future<List<Map<String, dynamic>>> getResponses() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorResponses);
      return (response.data as List)
          .map((item) => item as Map<String, dynamic>)
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/donors/me/consents
  Future<void> submitConsent(String consentType, bool granted) async {
    try {
      await _dio.post(
        ApiEndpoints.donorConsents,
        data: {
          'consent_type': consentType,
          'granted': granted,
        },
      );
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// GET /api/v1/donors/me/consents
  Future<List<Map<String, dynamic>>> getConsents() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorConsents);
      final List data = response.data as List;
      return data.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  Future<List<DonationVoucher>> getVouchers() async {
    try {
      final response = await _dio.get(ApiEndpoints.donorVouchers);
      return (response.data as List)
          .map((item) => DonationVoucher.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  Future<Map<String, dynamic>> addConsent(
      String consentType, bool granted) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.donorConsents,
        data: {'consent_type': consentType, 'granted': granted},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}

class DonationVoucher {
  const DonationVoucher({
    required this.id,
    required this.code,
    this.donorId,
    this.partnerId,
    required this.value,
    required this.status,
    this.issuedAt,
    this.expiresAt,
    this.redeemedAt,
    this.transactionReference,
  });

  final String code;
  final String id;
  final String? donorId;
  final String? partnerId;
  final String value;
  final String status;
  final DateTime? issuedAt;
  final DateTime? expiresAt;
  final DateTime? redeemedAt;
  final String? transactionReference;

  factory DonationVoucher.fromJson(Map<String, dynamic> json) {
    DateTime? date(String key) =>
        json[key] == null ? null : DateTime.tryParse(json[key].toString());
    return DonationVoucher(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      donorId: json['donor_id']?.toString(),
      partnerId: json['partner_id']?.toString(),
      value: json['value']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      issuedAt: date('issued_at'),
      expiresAt: date('expires_at'),
      redeemedAt: date('redeemed_at'),
      transactionReference: json['transaction_reference']?.toString(),
    );
  }
}

class NearbyBloodRequest {
  final String requestId;
  final String hospitalName;
  final String? governorate;
  final String bloodType;
  final String component;
  final int quantityUnits;
  final bool urgency;
  final double? distanceKm;
  final String? notes;
  final DateTime? createdAt;

  const NearbyBloodRequest({
    required this.requestId,
    required this.hospitalName,
    this.governorate,
    required this.bloodType,
    required this.component,
    required this.quantityUnits,
    required this.urgency,
    this.distanceKm,
    this.notes,
    this.createdAt,
  });

  factory NearbyBloodRequest.fromJson(Map<String, dynamic> json) {
    return NearbyBloodRequest(
      requestId: json['request_id'] as String? ?? '',
      hospitalName: json['hospital_name'] as String? ?? '—',
      governorate: json['governorate'] as String?,
      bloodType: json['blood_type'] as String? ?? '—',
      component: json['component'] as String? ?? '—',
      quantityUnits: json['quantity_units'] as int? ?? 0,
      urgency: json['urgency'] as bool? ?? false,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }
}
