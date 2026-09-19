import 'package:equatable/equatable.dart';

class DonorConsentModel extends Equatable {
  const DonorConsentModel({
    required this.id,
    required this.donorId,
    required this.consentType,
    required this.granted,
    this.grantedAt,
    this.revokedAt,
  });

  final String id;
  final String donorId;
  final String consentType;
  final bool granted;
  final DateTime? grantedAt;
  final DateTime? revokedAt;

  factory DonorConsentModel.fromJson(Map<String, dynamic> json) {
    return DonorConsentModel(
      id: json['id']?.toString() ?? '',
      donorId: json['donor_id']?.toString() ?? '',
      consentType: json['consent_type']?.toString() ?? '',
      granted: json['granted'] as bool? ?? false,
      grantedAt: json['granted_at'] != null
          ? DateTime.tryParse(json['granted_at'].toString())
          : null,
      revokedAt: json['revoked_at'] != null
          ? DateTime.tryParse(json['revoked_at'].toString())
          : null,
    );
  }

  @override
  List<Object?> get props =>
      [id, donorId, consentType, granted, grantedAt, revokedAt];
}
