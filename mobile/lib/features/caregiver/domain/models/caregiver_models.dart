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

class DonorMatchModel {
  final String donorId;
  final String bloodType;
  final bool available;
  final bool eligible;
  final String eligibilityStatus;
  final int daysUntilEligible;

  const DonorMatchModel({
    required this.donorId,
    required this.bloodType,
    required this.available,
    required this.eligible,
    required this.eligibilityStatus,
    required this.daysUntilEligible,
  });

  factory DonorMatchModel.fromJson(Map<String, dynamic> json) =>
      DonorMatchModel(
        donorId: json['donor_id'] as String? ?? '',
        bloodType: json['blood_type'] as String? ?? '',
        available: json['available'] as bool? ?? false,
        eligible: json['eligible'] as bool? ?? false,
        eligibilityStatus: json['eligibility_status'] as String? ?? 'unknown',
        daysUntilEligible: json['days_until_eligible'] as int? ?? 0,
      );
}
