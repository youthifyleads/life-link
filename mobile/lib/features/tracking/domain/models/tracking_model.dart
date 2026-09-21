import 'package:equatable/equatable.dart';

class TrackingPublic extends Equatable {
  final String reference;
  final String status;
  final String bloodType;
  final String component;
  final DateTime lastUpdated;
  final String? requestId;
  final double? unitPrice;
  final double? totalPrice;
  final String paymentStatus;
  final String? bankName;
  final String? bankLocation;
  final int quantity;
  final String? paymentUrl;
  final String? patientName;
  final String? medicalFileNumber;
  final int? patientAge;
  final String? patientGender;
  final String? hospitalName;
  final String? department;
  final String? roomBed;
  final String? attendingDoctor;
  final String? diagnosis;
  final String? currentHemoglobin;
  final String? urgencyLevel;
  final String? crossMatchStatus;
  final String? staffNotes;

  const TrackingPublic({
    required this.reference,
    required this.status,
    required this.bloodType,
    required this.component,
    required this.lastUpdated,
    this.requestId,
    this.unitPrice,
    this.totalPrice,
    this.paymentStatus = 'unpaid',
    this.bankName,
    this.bankLocation,
    this.quantity = 1,
    this.paymentUrl,
    this.patientName,
    this.medicalFileNumber,
    this.patientAge,
    this.patientGender,
    this.hospitalName,
    this.department,
    this.roomBed,
    this.attendingDoctor,
    this.diagnosis,
    this.currentHemoglobin,
    this.urgencyLevel,
    this.crossMatchStatus,
    this.staffNotes,
  });

  factory TrackingPublic.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['last_updated'] != null) {
      parsedDate = DateTime.tryParse(json['last_updated'] as String) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return TrackingPublic(
      reference: (json['reference'] ?? json['qr_code'] ?? json['tracking_reference'] ?? '') as String,
      status: (json['status'] ?? 'requested') as String,
      bloodType: (json['blood_type'] ?? '') as String,
      component: (json['component'] ?? 'whole_blood') as String,
      lastUpdated: parsedDate,
      requestId: json['request_id'] as String?,
      unitPrice: (json['unit_price'] as num?)?.toDouble(),
      totalPrice: (json['total_price'] as num?)?.toDouble(),
      paymentStatus: (json['payment_status'] as String?)?.toLowerCase() ?? 'unpaid',
      bankName: json['bank_name'] as String?,
      bankLocation: json['bank_location'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      paymentUrl: json['payment_url'] as String?,
      patientName: (json['patient_name'] ?? json['patient_full_name']) as String?,
      medicalFileNumber: (json['medical_record_number'] ?? json['medical_file_number'] ?? json['patient_file']) as String?,
      patientAge: (json['patient_age'] as num?)?.toInt(),
      patientGender: json['patient_gender'] as String?,
      hospitalName: (json['hospital_name'] ?? json['hospital']) as String?,
      department: (json['department'] ?? json['ward'] ?? json['unit']) as String?,
      roomBed: (json['room_bed'] ?? json['room'] ?? json['bed']) as String?,
      attendingDoctor: (json['attending_doctor'] ?? json['doctor_name'] ?? json['doctor']) as String?,
      diagnosis: (json['diagnosis'] ?? json['clinical_indication'] ?? json['reason']) as String?,
      currentHemoglobin: json['current_hemoglobin']?.toString(),
      urgencyLevel: (json['urgency_level'] ?? json['urgency'])?.toString(),
      crossMatchStatus: (json['cross_match_status'] ?? json['crossmatch']) as String?,
      staffNotes: (json['staff_notes'] ?? json['hospital_notes'] ?? json['notes']) as String?,
    );
  }

  bool get isPaid => paymentStatus == 'paid' || paymentStatus == 'completed';

  @override
  List<Object?> get props => [
        reference,
        status,
        bloodType,
        component,
        lastUpdated,
        requestId,
        unitPrice,
        totalPrice,
        paymentStatus,
        bankName,
        bankLocation,
        quantity,
        patientName,
        medicalFileNumber,
        patientAge,
        patientGender,
        hospitalName,
        department,
        roomBed,
        attendingDoctor,
        diagnosis,
        currentHemoglobin,
        urgencyLevel,
        crossMatchStatus,
        staffNotes,
      ];
}
