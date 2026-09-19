import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';
import '../../../payments/presentation/bloc/payment_cubit.dart';

class CaregiverBagScanResultScreen extends StatefulWidget {
  const CaregiverBagScanResultScreen({super.key, required this.result});

  final CaregiverBagScanModel result;

  @override
  State<CaregiverBagScanResultScreen> createState() =>
      _CaregiverBagScanResultScreenState();
}

class _CaregiverBagScanResultScreenState
    extends State<CaregiverBagScanResultScreen> with WidgetsBindingObserver {
  String? _paymentStatus;
  String? _paymentId;
  bool _isProcessing = false;
  bool _awaitingCheckoutReturn = false;
  late CaregiverBagScanModel _currentResult;

  CaregiverBagScanModel get result => _currentResult;

  double? get displayedTotalPrice =>
      result.totalPrice ??
      (result.unitPrice == null ? null : result.unitPrice! * result.quantity);

  bool get canPay =>
      result.requestId != null &&
      result.requestId!.isNotEmpty &&
      result.paymentStatus.toLowerCase() == 'unpaid';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentResult = widget.result;
    _paymentStatus = result.paymentStatus;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed &&
        _awaitingCheckoutReturn &&
        _paymentId != null) {
      _refreshPayment();
    }
  }

  Future<void> _startPayment() async {
    final requestId = result.requestId;
    if (!canPay || requestId == null) return;

    setState(() => _isProcessing = true);
    try {
      final payment = await context.read<PaymentCubit>().initiate(
            bloodRequestId: requestId,
            paymentMethod: 'card',
          );
      if (!mounted) return;

      _paymentId = payment?.paymentId;
      final checkoutUrl = payment?.checkoutUrl;
      if (payment == null ||
          _paymentId == null ||
          checkoutUrl == null ||
          checkoutUrl.isEmpty) {
        throw StateError(
            'Payment checkout URL was not provided by the server.');
      }

      final uri = Uri.tryParse(checkoutUrl);
      if (uri == null || (uri.scheme != 'http' && uri.scheme != 'https')) {
        throw StateError('Payment checkout URL is invalid.');
      }

      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched) {
        throw StateError('Unable to open the payment checkout.');
      }

      setState(() {
        _awaitingCheckoutReturn = true;
        _paymentStatus = payment.paymentStatus;
      });
    } catch (error) {
      if (!mounted) return;
      _awaitingCheckoutReturn = false;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(friendlyErrorMessage(error)),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _refreshPayment() async {
    final paymentId = _paymentId;
    if (paymentId == null || !mounted) return;
    _awaitingCheckoutReturn = false;

    try {
      final payment = await context.read<PaymentCubit>().refresh(paymentId);
      if (!mounted || payment == null) return;
      var refreshedResult = result;
      if (result.qrCode != null && result.qrCode!.isNotEmpty) {
        refreshedResult =
            await getIt<CaregiverRemoteDataSource>().getBagByQr(result.qrCode!);
      }
      if (!mounted) return;
      setState(() {
        _currentResult = refreshedResult;
        _paymentStatus = payment.paymentStatus;
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(friendlyErrorMessage(error)),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Result'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _section('Blood Information', [
            _row('Blood Type', result.bloodType),
            _row('Component', result.component),
            _row('Quantity', result.quantity.toString()),
            _row('Status', result.status),
          ]),
          const SizedBox(height: 16),
          _section('Blood Bank', [
            _row('Bank Name', result.bankName),
            _row('Bank Location', result.bankLocation),
          ]),
          const SizedBox(height: 16),
          _section('Pricing', [
            if (result.unitPrice != null)
              _row('Unit Price', 'EGP ${result.unitPrice}'),
            if (displayedTotalPrice != null)
              _row('Total Price', 'EGP $displayedTotalPrice'),
          ]),
          const SizedBox(height: 16),
          _section('Payment', [
            _row('Payment Status', _paymentStatus),
          ]),
          if (canPay && _paymentStatus?.toLowerCase() == 'unpaid') ...[
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _isProcessing ? null : _startPayment,
              icon: _isProcessing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.payment),
              label: const Text('Proceed to Payment'),
            ),
          ],
          if (result.requestId != null) ...[
            const SizedBox(height: 16),
            _section('Linked Request', [
              _row('Request ID', result.requestId),
            ]),
          ],
          if (result.trackingReference != null &&
              result.trackingReference!.isNotEmpty) ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => context.push(
                '/tracking/lookup',
                extra: result.trackingReference,
              ),
              icon: const Icon(Icons.local_shipping_outlined),
              label: const Text('View tracking status'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _section(String title, List<Widget> rows) {
    return Card(
      color: AppColors.surface,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...rows,
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label,
                style: const TextStyle(color: AppColors.textSecondary)),
          ),
          Expanded(child: Text(value ?? 'Not provided')),
        ],
      ),
    );
  }
}
