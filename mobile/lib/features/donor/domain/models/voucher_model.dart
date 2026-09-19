import 'package:equatable/equatable.dart';

class VoucherModel extends Equatable {
  final String id;
  final String? donorId;
  final String voucherCode;
  final double discountPercentage;
  final String? partnerId;
  final String status;
  final DateTime issuedAt;
  final DateTime expiresAt;
  final DateTime? redeemedAt;
  final String? transactionReference;

  const VoucherModel({
    required this.id,
    this.donorId,
    required this.voucherCode,
    required this.discountPercentage,
    this.partnerId,
    required this.status,
    required this.issuedAt,
    required this.expiresAt,
    this.redeemedAt,
    this.transactionReference,
  });

  String get code => voucherCode;
  String get value => discountPercentage.toString();

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic val) {
      if (val == null) return DateTime.now();
      return DateTime.tryParse(val.toString()) ?? DateTime.now();
    }

    final rawVal = json['discount_percentage'] ?? json['value'];
    double discount = 0.0;
    if (rawVal is num) {
      discount = rawVal.toDouble();
    } else if (rawVal != null) {
      discount = double.tryParse(rawVal.toString()) ?? 0.0;
    }

    return VoucherModel(
      id: json['id']?.toString() ?? '',
      donorId: json['donor_id']?.toString(),
      voucherCode: (json['voucher_code'] ?? json['code'])?.toString() ?? '',
      discountPercentage: discount,
      partnerId: json['partner_id']?.toString(),
      status: (json['status']?.toString() ?? 'ACTIVE').toUpperCase(),
      issuedAt: parseDate(json['issued_at']),
      expiresAt: parseDate(json['expires_at']),
      redeemedAt: json['redeemed_at'] != null
          ? DateTime.tryParse(json['redeemed_at'].toString())
          : null,
      transactionReference: json['transaction_reference']?.toString(),
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
        transactionReference,
      ];
}
