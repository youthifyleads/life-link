import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  // Card payment form controllers
  late final TextEditingController _cardNumberController;
  late final TextEditingController _expiryController;
  late final TextEditingController _cvvController;
  late final TextEditingController _cardHolderController;

  String? _cardError;

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

    _cardNumberController = TextEditingController(text: '0001 0000 0000 4000');
    _expiryController = TextEditingController(text: '12/28');
    _cvvController = TextEditingController(text: '123');
    _cardHolderController = TextEditingController(text: 'كريم أحمد الصاوي');
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _cardHolderController.dispose();
    super.dispose();
  }

  String get _maskedCardDisplay {
    final clean = _cardNumberController.text.replaceAll(' ', '').replaceAll('-', '');
    if (clean.length < 4) return '•••• •••• •••• 4000';
    final last4 = clean.substring(clean.length - 4);
    return '•••• •••• •••• $last4';
  }

  void _onPay() async {
    if (_selectedMethod == 'card') {
      _processCardPayment();
    } else {
      _processStandardPayment();
    }
  }

  void _processCardPayment() {
    final cleanCard = _cardNumberController.text.replaceAll(' ', '').replaceAll('-', '').trim();
    final expiry = _expiryController.text.trim();
    final cvv = _cvvController.text.trim();

    if (cleanCard.length < 12) {
      setState(() => _cardError = 'يرجى إدخال رقم بطاقة صحيح (16 رقم)');
      return;
    }
    if (!RegExp(r'^\d{2}/\d{2}$').hasMatch(expiry)) {
      setState(() => _cardError = 'يرجى إدخال تاريخ انتهاء صحيح (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      setState(() => _cardError = 'يرجى إدخال رمز الأمان CVV (3 أرقام على الأقل)');
      return;
    }

    setState(() => _cardError = null);
    _promptOtpDialog(cleanCard, expiry, cvv);
  }

  void _promptOtpDialog(String cleanCard, String expiry, String cvv) {
    final otpController = TextEditingController(text: '1234');
    bool isSubmittingOtp = false;
    String? otpError;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.security_rounded, color: AppColors.primary, size: 28),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'تأكيد الدفع عبر Paymob 3D Secure',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'سيتم خصم مبلغ ${_confirmedAmount ?? "900.00"} ج.م من البطاقة:',
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _maskedCardDisplay,
                  textDirection: TextDirection.ltr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'رمز التحقق للبنك (OTP):',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: otpController,
                keyboardType: TextInputType.number,
                textDirection: TextDirection.ltr,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  hintText: '1234',
                  helperText: 'كود التجربة والتحقق المعتمد: 1234',
                  helperStyle: const TextStyle(color: AppColors.primary, fontSize: 11),
                  errorText: otpError,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isSubmittingOtp ? null : () => Navigator.of(ctx).pop(),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: isSubmittingOtp
                  ? null
                  : () async {
                      final otp = otpController.text.trim();
                      if (otp.isEmpty) {
                        setModalState(() => otpError = 'يرجى إدخال رمز التحقق');
                        return;
                      }
                      setModalState(() {
                        isSubmittingOtp = true;
                        otpError = null;
                      });

                      try {
                        final reqId = widget.request?.id ?? widget.allocationId ?? 'REQ-TEST';
                        final cubit = context.read<PaymentCubit>();
                        final payment = await cubit.payWithCard(
                          bloodRequestId: reqId,
                          cardNumber: cleanCard,
                          expiryDate: expiry,
                          cvv: cvv,
                          cardHolder: _cardHolderController.text.trim(),
                          otp: otp,
                        );

                        if (!mounted) return;
                        if (ctx.mounted) {
                          Navigator.of(ctx).pop();
                        }

                        if (payment != null) {
                          _showPaymentStatus(
                            payment.paymentStatus,
                            paymentId: payment.paymentId,
                            transactionReference: payment.transactionReference,
                            maskedCard: payment.maskedCard ?? _maskedCardDisplay,
                          );
                        } else {
                          throw Exception('فشل تنفيذ عملية الدفع عبر البطاقة');
                        }
                      } catch (e) {
                        setModalState(() {
                          isSubmittingOtp = false;
                          otpError = friendlyErrorMessage(e);
                        });
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: isSubmittingOtp
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('تأكيد وسداد الآن'),
            ),
          ],
        ),
      ),
    );
  }

  void _processStandardPayment() async {
    setState(() => _isProcessing = true);
    try {
      final cubit = context.read<PaymentCubit>();
      final payment = await cubit.initiate(
        bloodRequestId: widget.request?.id,
        allocationId: widget.allocationId,
        paymentMethod: _selectedMethod,
      );
      if (payment == null) {
        throw Exception(cubit.state.error);
      }
      if (!mounted) return;
      setState(() => _isProcessing = false);
      setState(() {
        _confirmedAmount = payment.amount;
      });
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
      if (!mounted) return;
      _showPaymentStatus(
        payment.paymentStatus,
        paymentId: payment.paymentId,
        transactionReference: payment.transactionReference,
        maskedCard: payment.maskedCard,
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
                          : 'في انتظار تأكيد السداد',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold),
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
                    subtitle: 'دفع فوري وآمن ببيانات البطاقة عبر Paymob',
                    icon: Icons.credit_card_rounded,
                  ),
                  const SizedBox(height: 12),
                  _paymentOption(
                    id: 'wallet',
                    title: 'محفظة إلكترونية أو إنستاباي',
                    subtitle: 'فودافون كاش، أورنج، إنستاباي، وغيرها',
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

            // In-App Card Entry Form for Caregivers
            if (_selectedMethod == 'card') ...[
              const SizedBox(height: 20),
              _buildCardEntrySection(),
            ],

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

  Widget _buildCardEntrySection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.35), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Live Card Visual Preview
          Container(
            height: 140,
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1E36), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 24,
                          decoration: BoxDecoration(
                            color: const Color(0xFFD4AF37),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Icon(Icons.memory, size: 16, color: Colors.black54),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.contactless_rounded, color: Colors.white70, size: 20),
                      ],
                    ),
                    const Text(
                      'Paymob Verified',
                      style: TextStyle(
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Text(
                  _maskedCardDisplay,
                  textDirection: TextDirection.ltr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'monospace',
                    fontSize: 16,
                    letterSpacing: 2.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _cardHolderController.text.isNotEmpty
                          ? _cardHolderController.text
                          : 'CAREGIVER / PATIENT',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      children: [
                        const Text(
                          'EXP: ',
                          style: TextStyle(color: Colors.white54, fontSize: 9),
                        ),
                        Text(
                          _expiryController.text.isNotEmpty ? _expiryController.text : '12/28',
                          textDirection: TextDirection.ltr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          if (_cardError != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.error.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _cardError!,
                      style: const TextStyle(color: AppColors.error, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Card Number Input (Strictly LTR)
          const Text(
            'رقم البطاقة (16 رقم):',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _cardNumberController,
            keyboardType: TextInputType.number,
            textDirection: TextDirection.ltr,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9\s]')),
              LengthLimitingTextInputFormatter(19),
            ],
            onChanged: (val) {
              setState(() {});
            },
            decoration: InputDecoration(
              hintText: '0001 0000 0000 4000',
              hintTextDirection: TextDirection.ltr,
              prefixIcon: const Icon(Icons.credit_card_outlined),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
            ),
          ),

          const SizedBox(height: 14),

          // Expiry and CVV Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'تاريخ الصلاحية:',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _expiryController,
                      keyboardType: TextInputType.datetime,
                      textDirection: TextDirection.ltr,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[0-9/]')),
                        LengthLimitingTextInputFormatter(5),
                      ],
                      onChanged: (val) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: 'MM/YY (12/28)',
                        hintTextDirection: TextDirection.ltr,
                        prefixIcon: const Icon(Icons.date_range_outlined, size: 20),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'رمز الأمان (CVV):',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _cvvController,
                      keyboardType: TextInputType.number,
                      textDirection: TextDirection.ltr,
                      obscureText: true,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(4),
                      ],
                      onChanged: (val) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: '123',
                        hintTextDirection: TextDirection.ltr,
                        prefixIcon: const Icon(Icons.lock_clock_outlined, size: 20),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Cardholder Name
          const Text(
            'اسم صاحب البطاقة:',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _cardHolderController,
            onChanged: (val) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'الاسم كما هو مدون على البطاقة',
              prefixIcon: const Icon(Icons.person_outline_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
            ),
          ),
        ],
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
