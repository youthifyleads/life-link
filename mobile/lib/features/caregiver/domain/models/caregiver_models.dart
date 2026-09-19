class PatientModel {
  final String id;
  final String fullName;
  final String bloodType;
  final String? hospitalId;
  final String? notes;

  const PatientModel({
    required this.id,
    required this.fullName,
    required this.bloodType,
    this.hospitalId,
    this.notes,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) => PatientModel(
        id: json['id'] as String? ?? '',
        fullName: json['full_name'] as String? ?? '',
        bloodType: json['blood_type'] as String? ?? '',
        hospitalId: json['hospital_id'] as String?,
        notes: json['notes'] as String?,
      );
}

class CaregiverAssignmentModel {
  final String id;
  final String bloodBagId;
  final String caregiverUserId;
  final String hospitalId;
  final DateTime? assignmentDate;
  final String status;
  final String? notes;

  const CaregiverAssignmentModel({
    required this.id,
    required this.bloodBagId,
    required this.caregiverUserId,
    required this.hospitalId,
    required this.assignmentDate,
    required this.status,
    this.notes,
  });

  factory CaregiverAssignmentModel.fromJson(Map<String, dynamic> json) =>
      CaregiverAssignmentModel(
        id: json['id'] as String? ?? '',
        bloodBagId: json['blood_bag_id'] as String? ?? '',
        caregiverUserId: json['caregiver_user_id'] as String? ?? '',
        hospitalId: json['hospital_id'] as String? ?? '',
        assignmentDate: json['assignment_date'] != null
            ? DateTime.tryParse(json['assignment_date'].toString())
            : null,
        status: json['status'] as String? ?? 'assigned',
        notes: json['notes'] as String?,
      );
}

class CaregiverBagScanModel {
  final String? bloodBagId;
  final String? requestId;
  final String bloodType;
  final String? component;
  final int quantity;
  final String status;
  final String bankName;
  final String bankLocation;
  final String? qrCode;
  final double? unitPrice;
  final double? totalPrice;
  final String paymentStatus;
  final String? paymentUrl;
  final String? trackingReference;

  const CaregiverBagScanModel({
    this.bloodBagId,
    this.requestId,
    required this.bloodType,
    this.component,
    required this.quantity,
    required this.status,
    required this.bankName,
    required this.bankLocation,
    this.qrCode,
    this.unitPrice,
    this.totalPrice,
    required this.paymentStatus,
    this.paymentUrl,
    this.trackingReference,
  });

  factory CaregiverBagScanModel.fromJson(Map<String, dynamic> json) {
    return CaregiverBagScanModel(
      bloodBagId: json['blood_bag_id'] as String?,
      requestId: json['request_id'] as String?,
      bloodType: json['blood_type'] as String? ?? '',
      component: json['component'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      status: json['status'] as String? ?? '',
      bankName: json['bank_name'] as String? ?? '',
      bankLocation: json['bank_location'] as String? ?? '',
      qrCode: json['qr_code'] as String?,
      unitPrice: (json['unit_price'] as num?)?.toDouble(),
      totalPrice: (json['total_price'] as num?)?.toDouble(),
      paymentStatus: json['payment_status'] as String? ?? '',
      paymentUrl: json['payment_url'] as String?,
      trackingReference:
          (json['tracking_reference'] ?? json['reference']) as String?,
    );
  }
}

class DonorMatchModel {
  final String donorId;
  final String? userId;
  final String? fullName;
  final String? phone;
  final String bloodType;
  final String? governorate;
  final String eligibilityStatus;
  final DateTime? lastDonationDate;
  final int? daysSinceLastDonation;
  final double? distanceKm;

  const DonorMatchModel({
    required this.donorId,
    this.userId,
    this.fullName,
    this.phone,
    required this.bloodType,
    this.governorate,
    required this.eligibilityStatus,
    this.lastDonationDate,
    this.daysSinceLastDonation,
    this.distanceKm,
  });

  factory DonorMatchModel.fromJson(Map<String, dynamic> json) =>
      DonorMatchModel(
        donorId: json['donor_id'] as String? ?? '',
        userId: json['user_id'] as String?,
        fullName: json['full_name'] as String?,
        phone: json['phone'] as String?,
        bloodType: json['blood_type'] as String? ?? '',
        governorate: json['governorate'] as String?,
        eligibilityStatus: json['eligibility_status'] as String? ?? 'unknown',
        lastDonationDate: json['last_donation_date'] != null
            ? DateTime.tryParse(json['last_donation_date'].toString())
            : null,
        daysSinceLastDonation:
            (json['days_since_last_donation'] as num?)?.toInt(),
        distanceKm: (json['distance_km'] as num?)?.toDouble(),
      );
}
