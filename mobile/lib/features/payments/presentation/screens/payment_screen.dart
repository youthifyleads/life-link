import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../domain/models/payment_model.dart';
import '../bloc/payment_cubit.dart';

class PaymentScreen extends StatefulWidget {
  final BloodRequestPublic? request;
  final String? allocationId;
  final double? initialAmount;
  final String? hospitalOrBankName;

  const PaymentScreen({
    super.key,
    this.request,
    this.allocationId,
    this.initialAmount,
    this.hospitalOrBankName,
  }) : assert(request != null || allocationId != null);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'card';
  bool _isProcessing = false;
  String? _confirmedAmount;

  @override
  void initState() {
    super.initState();
    if (widget.initialAmount != null && widget.initialAmount! > 0) {
      _confirmedAmount = widget.initialAmount!.toStringAsFixed(2);
    } else if (widget.request != null) {
      final unitP = widget.request?.unitPrice ?? 450.0;
      final qty = widget.request?.quantityUnits ?? 1;
      _confirmedAmount = (unitP * qty).toStringAsFixed(2);
    } else {
      _confirmedAmount = '900.00';
    }
  }

  void _onPay() async {
    setState(() => _isProcessing = true);
    try {
      final cubit = context.read<PaymentCubit>();
      final payment = await cubit.initiate(
        bloodRequestId: widget.request?.id,
        allocationId: widget.allocationId,
        paymentMethod: _selectedMethod,
      );
      if (payment == null) {
        throw Exception(cubit.state.error ?? 'تعذر بدء عملية الدفع');
      }
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        if (payment.amount.isNotEmpty) {
          _confirmedAmount = payment.amount;
        }
      });

      final checkoutUrl = payment.checkoutUrl;
      if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
        final uri = Uri.parse(checkoutUrl);
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
        if (!launched && mounted) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      }

      if (!mounted) return;
      _showPaymentStatus(
        payment.paymentStatus,
        paymentId: payment.paymentId,
        transactionReference: payment.transactionReference,
        maskedCard: payment.maskedCard,
        checkoutUrl: checkoutUrl,
      );
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(apiErrorMessage(error)),
          backgroundColor: AppColors.error,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(friendlyErrorMessage(e)),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }


  Future<PaymentModel> _getPaymentStatus(String paymentId) async {
    final cubit = context.read<PaymentCubit>();
    final payment = await cubit.refresh(paymentId);
    if (payment == null) {
      throw Exception(cubit.state.error);
    }
    return payment;
  }

  void _showPaymentStatus(
    String status, {
    String? paymentId,
    String? transactionReference,
    String? maskedCard,
    String? checkoutUrl,
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
                      ? 'تم تأكيد السداد بنجاح'
                      : isFailure
                          ? 'لم يكتمل السداد'
                          : 'في انتظار إتمام السداد عبر Paymob',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'حالة الدفع: ${isSuccessful ? 'مدفوع ومؤكد (Paymob)' : currentStatus.toUpperCase()}\n'
                  'المبلغ: ${_confirmedAmount ?? "900.00"} ج.م\n'
                  'رقم الطلب: ${widget.request?.trackingReference ?? widget.request?.id ?? "تخصيص ${widget.allocationId}"}'
                  '${maskedCard != null ? '\nالبطاقة المستخدمة: $maskedCard' : ''}'
                  '${currentTransactionReference == null ? '' : '\nرقم المعاملة: $currentTransactionReference'}',
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
                const SizedBox(height: 16),
                if (!isSuccessful && checkoutUrl != null && checkoutUrl.isNotEmpty) ...[
                  OutlinedButton.icon(
                    onPressed: () async {
                      final uri = Uri.parse(checkoutUrl);
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    },
                    icon: const Icon(Icons.open_in_new_rounded, size: 16),
                    label: const Text('فتح صفحة Paymob مرة أخرى'),
                  ),
                  const SizedBox(height: 8),
                ],
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
                            } on DioException catch (error) {
                              setDialogState(() {
                                refreshError = apiErrorMessage(error);
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
                    label: Text(isRefreshing ? 'جاري التحديث...' : 'تحديث حالة السداد'),
                  ),
                const SizedBox(height: 10),
                LifeLinkButton(
                  label: 'تم الإنهاء',
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
    final int units = widget.request?.quantityUnits ?? 2;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('سداد الطلب عبر Paymob'),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Paymob',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.adaptive.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // LifeLink Logo and Header
            Center(
              child: Column(
                children: [
                  Image.asset(
                    'assets/images/logo.png',
                    height: 48,
                    errorBuilder: (_, __, ___) => const Icon(
                      Icons.bloodtype_rounded,
                      color: AppColors.primary,
                      size: 44,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'منظومة LifeLink - بوابة السداد الإلكتروني المعتمدة',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),

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
                  Text('ملخص الطلب والفاتورة',
                      style: Theme.of(context).textTheme.titleMedium),
                  const Divider(height: 24),
                  if (widget.hospitalOrBankName != null && widget.hospitalOrBankName!.isNotEmpty)
                    _summaryRow('المستشفى / بنك الدم', widget.hospitalOrBankName!),
                  _summaryRow(
                      'فصيلة الدم والكمية',
                      widget.request == null
                          ? 'كيس دم مخصص'
                          : '${widget.request!.bloodType} ($units وحدات)'),
                  _summaryRow(
                    'المكون المطلوب',
                    widget.request?.component == 'whole_blood'
                        ? 'دم كامل (Whole Blood)'
                        : (widget.request?.component ?? 'طلب معتمد'),
                  ),
                  _summaryRow(
                    'سعر الوحدة المعتمد',
                    '450.00 ج.م',
                  ),
                  _summaryRow(
                    'رقم التتبع المعتمد (REF)',
                    widget.request?.trackingReference ??
                        widget.request?.id ??
                        'تخصيص ${widget.allocationId}',
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'إجمالي المبلغ المطلوب',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _confirmedAmount == null
                            ? '900.00 ج.م'
                            : '$_confirmedAmount ج.م',
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

            const SizedBox(height: 24),

            Text('طريقة الدفع الإلكتروني',
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
                    title: 'بطاقة بنكية (فيزا / ماستركارد / ميزة)',
                    subtitle: 'دفع فوري وآمن عبر بوابة Paymob الرسمية',
                    icon: Icons.credit_card_rounded,
                  ),
                  const SizedBox(height: 12),
                  _paymentOption(
                    id: 'wallet',
                    title: 'محفظة إلكترونية أو إنستاباي',
                    subtitle: 'فودافون كاش، أورنج، إنستاباي، وغيرها عبر Paymob',
                    icon: Icons.account_balance_wallet_rounded,
                  ),
                  const SizedBox(height: 12),
                  _paymentOption(
                    id: 'hospital_cash',
                    title: 'سداد نقدي بخزينة المستشفى',
                    subtitle: 'يتم السداد عند تسليم المندوب للشحنة بالمستشفى',
                    icon: Icons.local_hospital_rounded,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            LifeLinkButton(
              label: _confirmedAmount == null
                  ? 'متابعة السداد الآمن عبر Paymob'
                  : 'سداد $_confirmedAmount ج.م الآن عبر Paymob',
              icon: Icons.lock_outline_rounded,
              isLoading: _isProcessing,
              onPressed: _onPay,
            ),
            const SizedBox(height: 12),
            Center(
              child: TextButton.icon(
                onPressed: () {
                  final ref = widget.request?.trackingReference ?? widget.request?.id;
                  if (ref != null && ref.isNotEmpty) {
                    context.push('/tracking', extra: ref);
                  }
                },
                icon: const Icon(Icons.route_rounded, size: 18),
                label: const Text(
                  'معاينة مسار الشحنة ومركبة النقل',
                  style: TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.w600),
                ),
              ),
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
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  fontSize: 13),
            ),
          ),
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
