import 'package:equatable/equatable.dart';

class DonorProfileModel extends Equatable {
  final String id;
  final String fullName;
  final String bloodType;
  final DateTime? lastDonationDate;
  final bool isEligible;
  final int daysUntilEligible;
  final int totalDonations;
  final bool availableToDonate;

  const DonorProfileModel({
    required this.id,
    required this.fullName,
    required this.bloodType,
    this.lastDonationDate,
    required this.isEligible,
    required this.daysUntilEligible,
    required this.totalDonations,
    required this.availableToDonate,
  });

  factory DonorProfileModel.fromJson(Map<String, dynamic> json) {
    final eligibilityStatus = json['eligibility_status'] as String?;
    final isEligible = json['is_eligible'] as bool? ??
        (eligibilityStatus != null
            ? eligibilityStatus.toLowerCase() == 'eligible'
            : false);

    return DonorProfileModel(
      id: json['id'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '—',
      bloodType: json['blood_type'] as String? ?? '—',
      lastDonationDate: json['last_donation_date'] != null
          ? DateTime.tryParse(json['last_donation_date'] as String)
          : null,
      isEligible: isEligible,
      daysUntilEligible: json['days_until_eligible'] as int? ?? 0,
      totalDonations: json['total_donations'] as int? ?? 0,
      availableToDonate: json['available_to_donate'] as bool? ??
          json['willing_to_donate'] as bool? ??
          false,
    );
  }

  @override
  List<Object?> get props => [
        id,
        fullName,
        bloodType,
        lastDonationDate,
        isEligible,
        daysUntilEligible,
        totalDonations,
        availableToDonate,
      ];
}

class DonationHistoryItem extends Equatable {
  final String id;
  final String hospitalName;
  final DateTime donationDate;
  final String bloodType;
  final String status;

  const DonationHistoryItem({
    required this.id,
    required this.hospitalName,
    required this.donationDate,
    required this.bloodType,
    required this.status,
  });

  factory DonationHistoryItem.fromJson(Map<String, dynamic> json) {
    return DonationHistoryItem(
      id: json['id'] as String? ?? '',
      hospitalName: json['hospital_name'] as String? ??
          json['blood_bank_id'] as String? ??
          'بنك الدم المركزي',
      donationDate: json['donation_date'] != null
          ? DateTime.tryParse(json['donation_date'] as String) ?? DateTime.now()
          : DateTime.now(),
      bloodType: json['blood_type'] as String? ?? 'O+',
      status: json['status'] as String? ?? 'completed',
    );
  }

  @override
  List<Object?> get props => [id, hospitalName, donationDate, status];
}
