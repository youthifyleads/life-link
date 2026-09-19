class PaymentModel {
  final String paymentId;
  final String bloodRequestId;
  final String amount;
  final String currency;
  final String provider;
  final String? providerOrderId;
  final String? clientSecret;
  final String paymentStatus;
  final String paymentMethod;
  final String? transactionReference;
  final String? checkoutUrl;
  final DateTime? createdAt;
  final DateTime? paidAt;
  final String? patientId;
  final String? allocationId;
  final String? bloodBagId;

  const PaymentModel({
    required this.paymentId,
    required this.bloodRequestId,
    required this.amount,
    this.currency = 'EGP',
    this.provider = 'paymob',
    this.providerOrderId,
    this.clientSecret,
    required this.paymentStatus,
    required this.paymentMethod,
    this.transactionReference,
    this.checkoutUrl,
    this.createdAt,
    this.paidAt,
    this.patientId,
    this.allocationId,
    this.bloodBagId,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    final rawAmount = json['amount'] ?? json['total_amount'];
    final paymentStatus = json['payment_status']?.toString() ?? 'pending';

    return PaymentModel(
      paymentId: (json['payment_id'] ?? json['id'])?.toString() ?? '',
      bloodRequestId: json['blood_request_id']?.toString() ?? '',
      amount: rawAmount == null ? '' : rawAmount.toString(),
      currency: json['currency']?.toString() ?? 'EGP',
      provider: json['provider']?.toString() ?? 'paymob',
      providerOrderId: json['provider_order_id']?.toString(),
      clientSecret: json['client_secret']?.toString(),
      paymentStatus: paymentStatus,
      paymentMethod: json['payment_method']?.toString() ?? 'card',
      transactionReference: json['transaction_reference']?.toString(),
      checkoutUrl: json['checkout_url']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      paidAt: json['paid_at'] != null
          ? DateTime.tryParse(json['paid_at'].toString())
          : null,
      patientId: json['patient_id']?.toString(),
      allocationId: json['allocation_id']?.toString(),
      bloodBagId: json['blood_bag_id']?.toString(),
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
