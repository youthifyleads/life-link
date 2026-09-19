import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../domain/models/tracking_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';

class TrackingDetailsScreen extends StatelessWidget {
  final TrackingPublic tracking;
  const TrackingDetailsScreen({super.key, required this.tracking});

  @override
  Widget build(BuildContext context) {
    final isPaid = tracking.isPaid;
    final hasPrice = tracking.totalPrice != null && tracking.totalPrice! > 0;
    final canPay = !isPaid && hasPrice && tracking.status != 'cancelled' && tracking.status != 'expired';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('تفاصيل ومتابعة الطلب'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      bottomNavigationBar: canPay
          ? Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    if (tracking.paymentUrl != null && tracking.paymentUrl!.isNotEmpty) {
                      final uri = Uri.parse(tracking.paymentUrl!);
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                        return;
                      }
                    }
                    if (!context.mounted) return;
                    context.push('/caregiver/payment', extra: tracking);
                  },
                  icon: const Icon(Icons.credit_card, color: Colors.white),
                  label: Text(
                    'ادفع الآن (${tracking.totalPrice!.toStringAsFixed(2)} ج.م)',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size.fromHeight(52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            )
          : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    _statusColor().withValues(alpha: 0.15),
                    _statusColor().withValues(alpha: 0.04),
                  ],
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _statusColor().withValues(alpha: 0.35)),
              ),
              child: Column(
                children: [
                  Icon(_statusIcon(), size: 56, color: _statusColor()),
                  const SizedBox(height: 12),
                  Text(
                    _statusLabel(),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: _statusColor(),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _statusDescription(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            Text('Bag Details', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),

            _buildInfoCard([
              _infoRow(
                  context, Icons.water_drop, 'Blood Type', tracking.bloodType),
              _infoRow(context, Icons.science, 'Component',
                  _componentLabel(tracking.component)),
              _infoRow(context, Icons.qr_code, 'Reference', tracking.reference,
                  monospace: true),
              _infoRow(
                  context,
                  Icons.schedule,
                  'Last Updated',
                  DateFormat('MMM d, y • h:mm a')
                      .format(tracking.lastUpdated.toLocal())),
              if (tracking.requestId != null)
                _infoRow(context, Icons.assignment, 'Request ID',
                    tracking.requestId!),
              if (tracking.bankName != null)
                _infoRow(context, Icons.account_balance, 'Blood Bank',
                    tracking.bankName!),
              if (tracking.paymentStatus != null)
                _infoRow(context, Icons.payment, 'Payment Status',
                    tracking.paymentStatus!),
              if (tracking.unitPrice != null)
                _infoRow(context, Icons.sell, 'Unit Price',
                    'EGP ${tracking.unitPrice}'),
              if (tracking.totalPrice != null)
                _infoRow(context, Icons.receipt_long, 'Total Price',
                    'EGP ${tracking.totalPrice}'),
            ]),

            const SizedBox(height: AppSpacing.xl),

            // Financial & Payment Card
            Text('الفاتورة وتفاصيل السداد',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.sm),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('حالة الدفع', style: TextStyle(color: AppColors.textSecondary)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isPaid
                                ? AppColors.success.withValues(alpha: 0.15)
                                : AppColors.warning.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isPaid ? 'تم السداد بنجاح' : 'غير مدفوع',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isPaid ? AppColors.success : AppColors.warning,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    _summaryRow('سعر الوحدة', tracking.unitPrice != null ? '${tracking.unitPrice!.toStringAsFixed(2)} ج.م' : 'بانتظار التسعير'),
                    const SizedBox(height: 8),
                    _summaryRow('الكمية المطلوبة', '${tracking.quantity} كيس/وحدة'),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'المبلغ الإجمالي',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          hasPrice ? '${tracking.totalPrice!.toStringAsFixed(2)} ج.م' : 'بانتظار التأكيد',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    if (tracking.bankName != null) ...[
                      const Divider(height: 24),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.local_hospital_outlined, size: 18, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  tracking.bankName!,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                if (tracking.bankLocation != null)
                                  Text(
                                    tracking.bankLocation!,
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Cold-Chain Logistics Stepper
            Text('سلسلة النقل والتسليم (Cold-Chain)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.sm),
            _buildCourierStepper(context),

            const SizedBox(height: AppSpacing.xl),

            // Clinical & Requisition Details
            Text('بيانات الفصيلة وإذن الطلب',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.sm),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    _infoRow(context, Icons.bloodtype, 'فصيلة الدم المطلوبة', tracking.bloodType, isBadge: true),
                    const Divider(height: 20),
                    _infoRow(context, Icons.science_outlined, 'المكون الطبي', _componentLabel(tracking.component)),
                    const Divider(height: 20),
                    _infoRow(context, Icons.qr_code_2, 'كود التتبع', tracking.reference, isCopyable: true),
                    const Divider(height: 20),
                    _infoRow(
                      context,
                      Icons.access_time,
                      'آخر تحديث',
                      DateFormat('yyyy-MM-dd • h:mm a').format(tracking.lastUpdated.toLocal()),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }

  Widget _buildCourierStepper(BuildContext context) {
    final status = tracking.status.toLowerCase();

    const isRequestedDone = true;
    final isPreparedDone = status == 'confirmed' || status == 'prepared' || status == 'in_transit' || status == 'completed';
    final isInTransitDone = status == 'in_transit' || status == 'completed';
    final isCompletedDone = status == 'completed';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            _stepperRow(
              isDone: isRequestedDone,
              isActive: status == 'requested' || status == 'acknowledged',
              title: 'إصدار إذن صرف الدم من المستشفى',
              subtitle: 'قام طبيب المستشفى بإنشاء الطلب وتحديد الفصيلة والمكون',
              isLast: false,
            ),
            _stepperRow(
              isDone: isPreparedDone,
              isActive: status == 'confirmed' || status == 'prepared',
              title: 'التجهيز والحفظ في سلسلة التبريد',
              subtitle: 'تم تخصيص أكياس الدم المطابقة وحفظها في الحافظة المبردة',
              isLast: false,
            ),
            _stepperRow(
              isDone: isInTransitDone,
              isActive: status == 'in_transit',
              title: 'في الطريق مع مندوب النقل الطبي المبرد',
              subtitle: 'الشحنة متجهة للمستشفى تحت مراقبة درجات الحرارة المعتمدة',
              isLast: false,
            ),
            _stepperRow(
              isDone: isCompletedDone,
              isActive: status == 'completed',
              title: 'تم التسليم لطاقم المستشفى بنجاح',
              subtitle: 'تم استلام وفحص أكياس الدم في بنك دم المستشفى لحقن المريض',
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepperRow({
    required bool isDone,
    required bool isActive,
    required String title,
    required String subtitle,
    required bool isLast,
  }) {
    Color indicatorColor = Colors.grey[300]!;
    if (isDone) indicatorColor = AppColors.success;
    if (isActive && !isDone) indicatorColor = AppColors.primary;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isDone ? AppColors.success : (isActive ? AppColors.primaryLight : Colors.grey[100]),
                shape: BoxShape.circle,
                border: Border.all(color: indicatorColor, width: 2),
              ),
              child: isDone
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : (isActive
                      ? Center(
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                        )
                      : null),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: isDone ? AppColors.success : Colors.grey[200],
              ),
          ],
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: (isDone || isActive) ? AppColors.navy : Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      ],
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String label, String value,
      {bool isBadge = false, bool isCopyable = false}) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: AppSpacing.md),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        const Spacer(),
        if (isBadge)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppColors.primary,
              ),
            ),
          )
        else
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        if (isCopyable) ...[
          const SizedBox(width: 6),
          InkWell(
            onTap: () {
              Clipboard.setData(ClipboardData(text: value));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم نسخ كود التتبع')),
              );
            },
            child: const Icon(Icons.copy, size: 16, color: AppColors.textSecondary),
          ),
        ],
      ],
    );
  }

  Color _statusColor() {
    switch (tracking.status.toLowerCase()) {
      case 'completed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      case 'expired':
        return Colors.grey;
      case 'prepared':
      case 'in_transit':
        return AppColors.info;
      default:
        return AppColors.warning;
    }
  }

  IconData _statusIcon() {
    switch (tracking.status.toLowerCase()) {
      case 'completed':
        return Icons.verified_rounded;
      case 'cancelled':
        return Icons.cancel_rounded;
      case 'expired':
        return Icons.timer_off_rounded;
      case 'in_transit':
        return Icons.local_shipping_rounded;
      case 'prepared':
        return Icons.ac_unit_rounded;
      case 'confirmed':
        return Icons.thumb_up_rounded;
      default:
        return Icons.pending_actions_rounded;
    }
  }

  String _statusLabel() {
    switch (tracking.status.toLowerCase()) {
      case 'requested':
        return 'طلب مسجل بالمستشفى';
      case 'acknowledged':
        return 'تم إقرار وتسعير الطلب';
      case 'confirmed':
        return 'تم تأكيد مطابقة الفصيلة';
      case 'prepared':
        return 'الأكياس جاهزة ومحفوظة بالتبريد';
      case 'in_transit':
        return 'في الطريق مع مندوب النقل الطبي';
      case 'completed':
        return 'تم تسليم الدم للمستشفى بنجاح';
      case 'cancelled':
        return 'تم إلغاء الطلب';
      case 'expired':
        return 'انتهت صلاحية الطلب';
      default:
        return tracking.status;
    }
  }

  String _statusDescription() {
    switch (tracking.status.toLowerCase()) {
      case 'requested':
        return 'تم إرسال إذن صرف الدم من طبيب المستشفى وبانتظار مراجعة بنك الدم.';
      case 'acknowledged':
        return 'قام بنك الدم بمراجعة وتحديد تكلفة معالجة الأكياس المطلوبة.';
      case 'confirmed':
        return 'تم فحص المخزون والتأكد من مطابقة فصيلة دم المريض تماماً.';
      case 'prepared':
        return 'أكياس الدم معقمة ومحفوظة داخل الحافظة المبردة تمهيداً للشحن.';
      case 'in_transit':
        return 'مندوب النقل الطبي المبرد في طريقه الآن لتسليم الشحنة لمستشفاكم.';
      case 'completed':
        return 'تم استلام الأكياس رسمياً في المستشفى وجاهزة لحقن المريض.';
      case 'cancelled':
        return 'تم إلغاء طلب الدم وإعادة الأكياس للفحص الرقابي والحجر الصحي.';
      case 'expired':
        return 'انتهت صلاحية الإذن الطبي المحدد لهذا الطلب.';
      default:
        return 'آخر تحديث مسجل في سجلات التتبع الوطنية.';
    }
  }

  String _componentLabel(String component) {
    switch (component.toLowerCase()) {
      case 'whole_blood':
        return 'دم كامل (Whole Blood)';
      case 'plasma':
        return 'بلازما طازجة (Fresh Plasma)';
      case 'platelets':
        return 'صفائح دموية (Platelets)';
      case 'red_cells':
      case 'packed_red_blood_cells':
        return 'كرات دم حمراء مركزة (PRBCs)';
      case 'cryoprecipitate':
        return 'راسب برودي (Cryoprecipitate)';
      default:
        return component;
    }
  }
}
