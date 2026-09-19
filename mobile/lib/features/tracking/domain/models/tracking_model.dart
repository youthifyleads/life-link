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
  final String? paymentStatus;
  final String? bankName;

  const TrackingPublic({
    required this.reference,
    required this.status,
    required this.bloodType,
    required this.component,
    required this.lastUpdated,
    this.requestId,
    this.unitPrice,
    this.totalPrice,
    this.paymentStatus,
    this.bankName,
  });

  factory TrackingPublic.fromJson(Map<String, dynamic> json) {
    return TrackingPublic(
      reference: json['reference'] as String,
      status: json['status'] as String,
      bloodType: json['blood_type'] as String,
      component: json['component'] as String,
      lastUpdated: DateTime.parse(json['last_updated'] as String),
      requestId: json['request_id'] as String?,
      unitPrice: (json['unit_price'] as num?)?.toDouble(),
      totalPrice: (json['total_price'] as num?)?.toDouble(),
      paymentStatus: json['payment_status'] as String?,
      bankName: json['bank_name'] as String?,
    );
  }

  @override
  List<Object?> get props =>
      [
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
      ];
}
