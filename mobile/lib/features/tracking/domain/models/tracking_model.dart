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
      ];
}
