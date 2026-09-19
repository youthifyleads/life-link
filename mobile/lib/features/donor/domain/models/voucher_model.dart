import 'package:equatable/equatable.dart';

class VoucherModel extends Equatable {
  final String id;
  final String donorId;
  final String voucherCode;
  final double discountPercentage;
  final String partnerId;
  final String status;
  final DateTime issuedAt;
  final DateTime expiresAt;
  final DateTime? redeemedAt;

  const VoucherModel({
    required this.id,
    required this.donorId,
    required this.voucherCode,
    required this.discountPercentage,
    required this.partnerId,
    required this.status,
    required this.issuedAt,
    required this.expiresAt,
    this.redeemedAt,
  });

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    return VoucherModel(
      id: json['id'] as String,
      donorId: json['donor_id'] as String,
      voucherCode: json['voucher_code'] as String,
      discountPercentage: (json['discount_percentage'] as num).toDouble(),
      partnerId: json['partner_id'] as String,
      status: (json['status'] as String).toUpperCase(),
      issuedAt: DateTime.parse(json['issued_at'] as String),
      expiresAt: DateTime.parse(json['expires_at'] as String),
      redeemedAt: json['redeemed_at'] != null
          ? DateTime.tryParse(json['redeemed_at'] as String)
          : null,
    );
  }

  bool get isActive => status == 'ACTIVE' && expiresAt.isAfter(DateTime.now());

  @override
  List<Object?> get props => [
        id,
        donorId,
        voucherCode,
        discountPercentage,
        partnerId,
        status,
        issuedAt,
        expiresAt,
        redeemedAt,
      ];
}
