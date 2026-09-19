import 'package:equatable/equatable.dart';

class DonorProfileModel extends Equatable {
  final String id;
  final String userId;
  final String? bloodType;
  final DateTime? dateOfBirth;
  final String? governorate;
  final String eligibilityStatus;
  final DateTime? lastDonationDate;
  final double? latitude;
  final double? longitude;

  const DonorProfileModel({
    required this.id,
    required this.userId,
    required this.bloodType,
    this.dateOfBirth,
    this.governorate,
    required this.eligibilityStatus,
    this.lastDonationDate,
    this.latitude,
    this.longitude,
  });

  factory DonorProfileModel.fromJson(Map<String, dynamic> json) {
    return DonorProfileModel(
      id: json['id'] as String? ?? '',
      userId: json['user_id'] as String? ?? '',
      bloodType: json['blood_type'] as String?,
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.tryParse(json['date_of_birth'].toString())
          : null,
      governorate: json['governorate'] as String?,
      eligibilityStatus: json['eligibility_status'] as String? ?? 'unknown',
      lastDonationDate: json['last_donation_date'] != null
          ? DateTime.tryParse(json['last_donation_date'].toString())
          : null,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        bloodType,
        dateOfBirth,
        governorate,
        eligibilityStatus,
        lastDonationDate,
        latitude,
        longitude,
      ];
}

class DonationHistoryItem extends Equatable {
  final String id;
  final String? bloodBankId;
  final DateTime? donationDate;
  final String? bloodType;
  final String? quantity;
  final String status;

  const DonationHistoryItem({
    required this.id,
    this.bloodBankId,
    this.donationDate,
    this.bloodType,
    this.quantity,
    required this.status,
  });

  factory DonationHistoryItem.fromJson(Map<String, dynamic> json) {
    return DonationHistoryItem(
      id: json['id'] as String? ?? '',
      bloodBankId:
          json['blood_bank_id'] as String? ?? json['hospital_name'] as String?,
      donationDate: json['donation_date'] != null
          ? DateTime.tryParse(json['donation_date'] as String)
          : null,
      bloodType: json['blood_type'] as String?,
      quantity: json['quantity']?.toString(),
      status: json['status'] as String? ?? 'unknown',
    );
  }

  String get hospitalName => bloodBankId ?? '—';

  @override
  List<Object?> get props =>
      [id, bloodBankId, donationDate, bloodType, quantity, status];
}
