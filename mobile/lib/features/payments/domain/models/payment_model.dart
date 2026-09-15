class PaymentModel {
  final String paymentId;
  final String bloodRequestId;
  final String amount;
  final String paymentStatus;
  final String paymentMethod;
  final String? transactionReference;
  final String? checkoutUrl;
  final DateTime? createdAt;
  final DateTime? paidAt;

  const PaymentModel({
    required this.paymentId,
    required this.bloodRequestId,
    required this.amount,
    required this.paymentStatus,
    required this.paymentMethod,
    this.transactionReference,
    this.checkoutUrl,
    this.createdAt,
    this.paidAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    final rawAmount = json['amount'];
    final paymentStatus = json['payment_status']?.toString() ?? 'pending';

    return PaymentModel(
      paymentId: (json['id'] ?? json['payment_id'])?.toString() ?? '',
      bloodRequestId: json['blood_request_id']?.toString() ?? '',
      amount: rawAmount == null ? '' : rawAmount.toString(),
      paymentStatus: paymentStatus,
      paymentMethod: json['payment_method']?.toString() ?? '',
      transactionReference: json['transaction_reference']?.toString(),
      checkoutUrl: json['checkout_url']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      paidAt: json['paid_at'] != null
          ? DateTime.tryParse(json['paid_at'].toString())
          : null,
    );
  }

  bool get isSuccessful =>
      paymentStatus == 'paid' ||
      paymentStatus == 'completed' ||
      paymentStatus == 'success' ||
      paymentStatus == 'succeeded';

  bool get isFailed =>
      paymentStatus == 'failed' ||
      paymentStatus == 'cancelled' ||
      paymentStatus == 'rejected' ||
      paymentStatus == 'checkout_unavailable';
}
