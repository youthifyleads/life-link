import 'package:equatable/equatable.dart';

class BloodRequestCreate extends Equatable {
  final String bloodType;
  final String component;
  final int quantityUnits;
  final bool urgency;
  final String? notes;
  final String? reason;
  final DateTime? requiredBy;

  const BloodRequestCreate({
    required this.bloodType,
    required this.component,
    required this.quantityUnits,
    this.urgency = false,
    this.notes,
    this.reason,
    this.requiredBy,
  });

  Map<String, dynamic> toJson() => {
        'blood_type': bloodType,
        'component': component,
        'quantity_units': quantityUnits,
        'urgency': urgency,
        'notes': notes ?? 'طلب نقل دم عبر تطبيق LifeLink',
        'reason': reason ?? 'حالة طبية طارئة',
        'required_by':
            (requiredBy ?? DateTime.now().add(const Duration(days: 2)).toUtc())
                .toIso8601String(),
      };

  @override
  List<Object?> get props =>
      [bloodType, component, quantityUnits, urgency, notes, reason, requiredBy];
}

class BloodRequestPublic extends Equatable {
  final String id;
  final String hospitalId;
  final String bloodType;
  final String component;
  final int quantityUnits;
  final bool urgency;
  final String? notes;
  final String? reason;
  final String status;
  final String trackingReference;
  final DateTime createdAt;

  const BloodRequestPublic({
    required this.id,
    required this.hospitalId,
    required this.bloodType,
    required this.component,
    required this.quantityUnits,
    required this.urgency,
    this.notes,
    this.reason,
    required this.status,
    required this.trackingReference,
    required this.createdAt,
  });

  factory BloodRequestPublic.fromJson(Map<String, dynamic> json) {
    return BloodRequestPublic(
      id: json['id'] as String? ?? '',
      hospitalId: json['hospital_id'] as String? ?? '',
      bloodType: json['blood_type'] as String? ?? 'O+',
      component: json['component'] as String? ?? 'whole_blood',
      quantityUnits: json['quantity_units'] as int? ?? 1,
      urgency: json['urgency'] as bool? ?? false,
      notes: json['notes'] as String?,
      reason: json['reason'] as String?,
      status: json['status'] as String? ?? 'requested',
      trackingReference: json['tracking_reference'] as String? ??
          'REF-${DateTime.now().millisecondsSinceEpoch}',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [id, status, trackingReference];
}
