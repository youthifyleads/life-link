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
        if (notes != null) 'notes': notes,
        if (reason != null) 'reason': reason,
        if (requiredBy != null)
          'required_by': requiredBy!.toUtc().toIso8601String(),
      };

  @override
  List<Object?> get props => [
        bloodType,
        component,
        quantityUnits,
        urgency,
        notes,
        reason,
        requiredBy,
      ];
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
  final double? unitPrice;
  final double? totalAmount;
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
    this.unitPrice,
    this.totalAmount,
    required this.status,
    required this.trackingReference,
    required this.createdAt,
  });

  factory BloodRequestPublic.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final hospitalId = json['hospital_id'];
    final bloodType = json['blood_type'];
    final component = json['component'];
    final quantityUnits = json['quantity_units'];
    final urgency = json['urgency'];
    final status = json['status'];
    final trackingReference = json['tracking_reference'];
    final createdAt = json['created_at'];

    if (id is! String ||
        hospitalId is! String ||
        bloodType is! String ||
        component is! String ||
        quantityUnits is! int ||
        urgency is! bool ||
        status is! String ||
        trackingReference is! String ||
        createdAt is! String) {
      throw const FormatException(
        'Blood request response is missing required fields.',
      );
    }

    final parsedCreatedAt = DateTime.tryParse(createdAt);
    if (parsedCreatedAt == null) {
      throw const FormatException('Blood request created_at is invalid.');
    }

    return BloodRequestPublic(
      id: id,
      hospitalId: hospitalId,
      bloodType: bloodType,
      component: component,
      quantityUnits: quantityUnits,
      urgency: urgency,
      notes: json['notes'] as String?,
      reason: json['reason'] as String?,
      unitPrice: (json['unit_price'] as num?)?.toDouble(),
      totalAmount: (json['total_amount'] as num?)?.toDouble(),
      status: status,
      trackingReference: trackingReference,
      createdAt: parsedCreatedAt,
    );
  }

  @override
  List<Object?> get props => [id, status, trackingReference];
}
