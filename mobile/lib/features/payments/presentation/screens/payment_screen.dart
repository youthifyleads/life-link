import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../domain/models/payment_model.dart';

class PaymentScreen extends StatefulWidget {
  final BloodRequestPublic request;

  const PaymentScreen({super.key, required this.request});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'card';
  bool _isProcessing = false;

  void _onPay() async {
    setState(() => _isProcessing = true);
    try {
      final response = await getIt<Dio>().post(
        ApiEndpoints.payments,
        data: {
          'amount': _totalAmount,
          'payment_method': _selectedMethod,
          'blood_request_id': widget.request.id,
        },
      );
      if (!mounted) return;
      setState(() => _isProcessing = false);
      final payment =
          PaymentModel.fromJson(response.data as Map<String, dynamic>);
      final checkoutUrl = payment.checkoutUrl;
      if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
        final launched = await launchUrl(Uri.parse(checkoutUrl),
            mode: LaunchMode.externalApplication);
        if (!launched && mounted) {
          _showPaymentStatus('checkout_unavailable',
              transactionReference: payment.transactionReference);
          return;
        }
      }
      _showPaymentStatus(payment.paymentStatus,
          transactionReference: payment.transactionReference);
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(apiErrorMessage(error)),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  double get _totalAmount {
    const processingFee = 150.0;
    const testScreeningFee = 200.0;
    return (processingFee + testScreeningFee) * widget.request.quantityUnits;
  }

  void _showPaymentStatus(String status, {String? transactionReference}) {
    final isSuccessful = status == 'paid' || status == 'completed';
    final isFailure = status == 'failed' ||
        status == 'cancelled' ||
        status == 'checkout_unavailable';
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSuccessful
                  ? Icons.check_circle_rounded
                  : isFailure
                      ? Icons.error_outline_rounded
                      : Icons.hourglass_top_rounded,
              color: isSuccessful
                  ? AppColors.success
                  : isFailure
                      ? AppColors.error
                      : AppColors.info,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              isSuccessful
                  ? 'Payment Confirmed!'
                  : isFailure
                      ? 'Payment Failed'
                      : 'Payment Pending',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Payment status: $status\nRequest: ${widget.request.trackingReference}'
              '${transactionReference == null ? '' : '\nTransaction: $transactionReference'}',
              textAlign: TextAlign.center,
              style:
                  const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 24),
            LifeLinkButton(
              label: 'Done',
              onPressed: () {
                Navigator.of(ctx).pop();
                context.pop();
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const double processingFee = 150.0;
    const double testScreeningFee = 200.0;
    final int units = widget.request.quantityUnits;
    final double totalAmount = _totalAmount;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout & Confirmation'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Summary
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Request Summary',
                      style: Theme.of(context).textTheme.titleMedium),
                  const Divider(height: 24),
                  _summaryRow('Blood Type & Units',
                      '${widget.request.bloodType} ($units Units)'),
                  _summaryRow('Component', widget.request.component),
                  _summaryRow('Reference', widget.request.trackingReference),
                  const Divider(height: 24),
                  _summaryRow('Processing & Storage',
                      'EGP ${(processingFee * units).toStringAsFixed(0)}'),
                  _summaryRow('Viral Screening & Testing',
                      'EGP ${(testScreeningFee * units).toStringAsFixed(0)}'),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Due',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'EGP ${totalAmount.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            Text('Payment Method',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),

            RadioGroup<String>(
              groupValue: _selectedMethod,
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedMethod = value);
                }
              },
              child: Column(
                children: [
                  _paymentOption(
                    id: 'card',
                    title: 'Credit / Debit Card',
                    subtitle: 'Visa, Mastercard, Meeza',
                    icon: Icons.credit_card_rounded,
                  ),
                  const SizedBox(height: 12),
                  _paymentOption(
                    id: 'wallet',
                    title: 'Smart Wallet / InstaPay',
                    subtitle: 'Vodafone Cash, Orange, InstaPay',
                    icon: Icons.account_balance_wallet_rounded,
                  ),
                  const SizedBox(height: 12),
                  _paymentOption(
                    id: 'cash',
                    title: 'Cash at Blood Bank Desk',
                    subtitle: 'Pay directly upon receiving blood bag',
                    icon: Icons.local_atm_rounded,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            LifeLinkButton(
              label: 'Confirm & Pay EGP ${totalAmount.toStringAsFixed(0)}',
              icon: Icons.lock_outline_rounded,
              isLoading: _isProcessing,
              onPressed: _onPay,
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13)),
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  fontSize: 13)),
        ],
      ),
    );
  }

  Widget _paymentOption({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedMethod == id;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => setState(() => _selectedMethod = id),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor:
                  isSelected ? AppColors.primaryLight : AppColors.background,
              child: Icon(icon,
                  color: isSelected ? AppColors.primary : AppColors.textHint),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: const TextStyle(
                          color: AppColors.textHint, fontSize: 12)),
                ],
              ),
            ),
            Radio<String>(
              value: id,
              activeColor: AppColors.primary,
            ),
          ],
        ),
      ),
    );
  }
}
