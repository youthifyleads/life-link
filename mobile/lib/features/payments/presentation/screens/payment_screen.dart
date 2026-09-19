import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../blood_requests/data/blood_request_remote_datasource.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../../caregiver/data/caregiver_remote_datasource.dart';
import '../../domain/models/payment_model.dart';
import '../bloc/payment_cubit.dart';

class PaymentScreen extends StatefulWidget {
  final BloodRequestPublic? request;
  final String? allocationId;

  const PaymentScreen({
    super.key,
    this.request,
    this.allocationId,
  }) : assert(request != null || allocationId != null);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen>
    with WidgetsBindingObserver {
  String _selectedMethod = 'card';
  bool _isProcessing = false;
  String? _confirmedAmount;
  String? _activePaymentId;
  String? _latestRequestStatus;
  bool _awaitingCheckoutReturn = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
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
        _activePaymentId != null) {
      _refreshAfterCheckout();
    }
  }

  void _onPay() async {
    setState(() => _isProcessing = true);
    try {
      final cubit = context.read<PaymentCubit>();
      final PaymentModel? payment;
      if (widget.request != null) {
        payment = await cubit.initiate(
          bloodRequestId: widget.request!.id,
          paymentMethod: _selectedMethod,
        );
      } else {
        final allocationId = widget.allocationId;
        if (allocationId == null || allocationId.isEmpty) {
          throw StateError('A payment target is required.');
        }
        final response = await getIt<CaregiverRemoteDataSource>()
            .initiateAllocationPayment(allocationId);
        payment = PaymentModel.fromJson(response);
      }
      if (payment == null) {
        if (mounted) {
          _showPaymentError(cubit.state.error);
        }
        return;
      }
      final activePayment = payment;
      if (!mounted) return;
      setState(() {
        _confirmedAmount = activePayment.amount;
      });
      final checkoutUrl = activePayment.checkoutUrl;
      if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
        final uri = Uri.tryParse(checkoutUrl);
        if (uri == null || (uri.scheme != 'http' && uri.scheme != 'https')) {
          _showPaymentStatus(
            'checkout_unavailable',
            paymentId: activePayment.paymentId,
            transactionReference: activePayment.transactionReference,
          );
          return;
        }
        bool launched;
        try {
          launched = await launchUrl(
            uri,
            mode: LaunchMode.externalApplication,
          );
        } catch (_) {
          launched = false;
        }
        if (!launched && mounted) {
          _awaitingCheckoutReturn = false;
          _showPaymentStatus('checkout_unavailable',
              paymentId: activePayment.paymentId,
              transactionReference: activePayment.transactionReference);
          return;
        }
        _activePaymentId = activePayment.paymentId;
        _awaitingCheckoutReturn = true;
        if (!mounted) return;
        _showPaymentStatus(
          activePayment.paymentStatus,
          paymentId: activePayment.paymentId,
          transactionReference: activePayment.transactionReference,
        );
        return;
      }
      if (!mounted) return;
      _showPaymentStatus(activePayment.paymentStatus,
          paymentId: activePayment.paymentId,
          transactionReference: activePayment.transactionReference);
    } catch (error) {
      if (mounted) {
        _showPaymentError(friendlyErrorMessage(error));
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _refreshAfterCheckout() async {
    final paymentId = _activePaymentId;
    if (paymentId == null || !mounted) return;
    _awaitingCheckoutReturn = false;

    try {
      final latest = await _getPaymentStatus(paymentId);
      await _refreshRequestStatus();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Payment status: ${latest.paymentStatus.toUpperCase()}'
            '${_latestRequestStatus == null ? '' : ' · Request: ${_latestRequestStatus!.toUpperCase()}'}',
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      _showPaymentError(friendlyErrorMessage(error));
    }
  }

  void _showPaymentError(Object? error) {
    final message = error is String && error.isNotEmpty
        ? error
        : friendlyErrorMessage(error ?? 'Payment failed');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  Future<PaymentModel> _getPaymentStatus(String paymentId) async {
    final cubit = context.read<PaymentCubit>();
    final payment = await cubit.refresh(paymentId);
    if (payment == null) {
      throw Exception(cubit.state.error);
    }
    return payment;
  }

  Future<void> _refreshRequestStatus() async {
    final requestId = widget.request?.id;
    if (requestId == null || requestId.isEmpty) return;
    final request =
        await getIt<BloodRequestRemoteDataSource>().getRequestById(requestId);
    if (mounted) {
      setState(() => _latestRequestStatus = request.status);
    }
  }

  void _showPaymentStatus(
    String status, {
    String? paymentId,
    String? transactionReference,
  }) {
    var currentStatus = status;
    var currentTransactionReference = transactionReference;
    var isRefreshing = false;
    String? refreshError;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final isSuccessful = {
            'paid',
            'completed',
            'success',
            'succeeded',
          }.contains(currentStatus.toLowerCase());
          final isFailure = {
            'failed',
            'cancelled',
            'rejected',
            'expired',
            'checkout_unavailable',
          }.contains(currentStatus.toLowerCase());

          return AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
                      ? 'Payment Confirmed'
                      : isFailure
                          ? 'Payment Not Completed'
                          : 'Payment Pending',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Payment status: ${currentStatus.toUpperCase()}\n'
                  '${_latestRequestStatus == null ? '' : 'Request status: ${_latestRequestStatus!.toUpperCase()}\n'}'
                  'Request: ${widget.request?.trackingReference ?? 'Allocation ${widget.allocationId}'}'
                  '${currentTransactionReference == null ? '' : '\nTransaction: $currentTransactionReference'}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 13),
                ),
                if (refreshError != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    refreshError!,
                    textAlign: TextAlign.center,
                    style:
                        const TextStyle(color: AppColors.error, fontSize: 12),
                  ),
                ],
                const SizedBox(height: 20),
                if (!isSuccessful && paymentId != null)
                  TextButton.icon(
                    onPressed: isRefreshing
                        ? null
                        : () async {
                            setDialogState(() {
                              isRefreshing = true;
                              refreshError = null;
                            });
                            try {
                              final latest = await _getPaymentStatus(paymentId);
                              await _refreshRequestStatus();
                              if (latest.amount.isNotEmpty && mounted) {
                                setState(
                                    () => _confirmedAmount = latest.amount);
                              }
                              setDialogState(() {
                                currentStatus = latest.paymentStatus;
                                currentTransactionReference =
                                    latest.transactionReference;
                                isRefreshing = false;
                              });
                            } catch (error) {
                              setDialogState(() {
                                refreshError = friendlyErrorMessage(error);
                                isRefreshing = false;
                              });
                            }
                          },
                    icon: isRefreshing
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.refresh_rounded),
                    label: const Text('Refresh payment status'),
                  ),
                LifeLinkButton(
                  label: 'Done',
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    context.pop();
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final int units = widget.request?.quantityUnits ?? 0;

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
                  _summaryRow(
                      'Blood Type & Units',
                      widget.request == null
                          ? 'Allocated blood bag'
                          : '${widget.request!.bloodType} ($units Units)'),
                  _summaryRow(
                    'Component',
                    widget.request?.component ?? 'Confirmed allocation',
                  ),
                  _summaryRow(
                    'Reference',
                    widget.request?.trackingReference ??
                        'Allocation ${widget.allocationId}',
                  ),
                  const Divider(height: 24),
                  _summaryRow(
                    'Amount confirmed by backend',
                    _confirmedAmount == null
                        ? 'Calculated after payment initiation'
                        : 'EGP $_confirmedAmount',
                  ),
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
                        _confirmedAmount == null
                            ? '—'
                            : 'EGP $_confirmedAmount',
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
              label: _confirmedAmount == null
                  ? 'Start secure payment'
                  : 'Pay EGP $_confirmedAmount',
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
