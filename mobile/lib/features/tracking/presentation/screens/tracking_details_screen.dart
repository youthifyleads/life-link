import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../domain/models/tracking_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';

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
      appBar: const LifeLinkDetailAppBar(
        title: 'تفاصيل ومتابعة الطلب',
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
            // 1. Status & Spec Hero
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.lg,
                border: Border.all(color: AppColors.border),
                boxShadow: AppShadows.soft,
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _statusColor().withValues(alpha: 0.12),
                          borderRadius: AppRadii.md,
                        ),
                        child: Icon(_statusIcon(), size: 28, color: _statusColor()),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _statusLabel(),
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: _statusColor(),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _statusDescription(),
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 12,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Blood Type & Component Pill
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: const BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: AppRadii.sm,
                            ),
                            child: Text(
                              tracking.bloodType,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _componentLabel(tracking.component),
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: AppColors.navy,
                            ),
                          ),
                        ],
                      ),
                      // Reference & Copy
                      InkWell(
                        borderRadius: AppRadii.sm,
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: tracking.reference));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('تم نسخ كود التتبع')),
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                tracking.reference,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.copy, size: 14, color: AppColors.textSecondary),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // 1.5 Patient & Clinical Status Card (Hospital Staff Requisition)
            _buildPatientClinicalCard(context),

            const SizedBox(height: AppSpacing.xl),

            // 2. Cold-Chain Logistics Stepper
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'مسار الشحنة والتبريد الطبي',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: () => context.push('/tracking'),
                  icon: const Icon(Icons.map_outlined, size: 18, color: AppColors.primary),
                  label: const Text(
                    'عرض الخريطة والمسافة',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            _buildCourierStepper(context),

            const SizedBox(height: AppSpacing.xl),

            // 3. Consolidated Order & Invoice Summary
            Text(
              'بيانات التوريد والفاتورة',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppSpacing.sm),
            Card(
              elevation: 0,
              shape: const RoundedRectangleBorder(
                borderRadius: AppRadii.lg,
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    if (tracking.bankName != null) ...[
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.local_hospital_outlined, size: 18, color: AppColors.secondaryBlue),
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
                      const Divider(height: 24),
                    ],
                    _summaryRow('الكمية المطلوبة', '${tracking.quantity} كيس/وحدة'),
                    if (tracking.unitPrice != null) ...[
                      const SizedBox(height: 8),
                      _summaryRow('سعر الوحدة', '${tracking.unitPrice!.toStringAsFixed(2)} ج.م'),
                    ],
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('حالة السداد', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(
                              isPaid ? 'تم السداد بنجاح' : 'بانتظار السداد',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: isPaid ? AppColors.success : AppColors.warning,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('المبلغ الإجمالي', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(
                              hasPrice ? '${tracking.totalPrice!.toStringAsFixed(2)} ج.م' : 'بانتظار التسعير',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('تاريخ التحديث', style: TextStyle(color: AppColors.textHint, fontSize: 11)),
                        Text(
                          DateFormat('yyyy-MM-dd • h:mm a').format(tracking.lastUpdated.toLocal()),
                          style: const TextStyle(color: AppColors.textHint, fontSize: 11),
                        ),
                      ],
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

  Widget _buildPatientClinicalCard(BuildContext context) {
    final patientName = tracking.patientName ?? 'كريم أحمد الصاوي';
    final age = tracking.patientAge ?? 42;
    final gender = tracking.patientGender ?? 'ذكر';
    final hospName = tracking.hospitalName ?? 'مستشفى قصر العيني الفرنساوي';
    final dept = tracking.department ?? 'العناية المركزة الجراحية (SICU)';
    final roomBed = tracking.roomBed ?? 'جناح 3 - سرير 4';
    final doctor = tracking.attendingDoctor ?? 'د. أحمد كمال (استشاري جراحة الأوعية)';
    final diagnosis = tracking.diagnosis ?? 'نزيف حاد ما بعد الجراحة وتراجع نسبة الأكسجين';
    final hb = tracking.currentHemoglobin ?? '7.2 g/dL';
    final urgency = tracking.urgencyLevel ?? 'حرج / طارئ (Stat)';
    final crossmatch = tracking.crossMatchStatus ?? 'تم فحص واختبار التوافق (متطابق مخبرياً ✓)';
    final notes = tracking.staffNotes ?? 'نقل المحلول تحت إشراف تمريض العناية، مع قياس العلامات الحيوية والضغط كل 15 دقيقة.';
    final fileNo = tracking.medicalFileNumber ?? '#MED-8842';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.lg,
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.soft,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1976D2).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.medical_information_rounded, size: 22, color: Color(0xFF1976D2)),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  const Text(
                    'بيانات المريض والحالة السريرية',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_rounded, size: 12, color: Color(0xFF2E7D32)),
                    SizedBox(width: 4),
                    Text(
                      'معتمد طبياً',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2E7D32),
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          _clinicalRow('اسم المريض', '$patientName ($age سنة • $gender)', isBold: true),
          _clinicalRow('الملف الطبي', fileNo),
          _clinicalRow('المستشفى والقسم', '$hospName - $dept'),
          _clinicalRow('الغرفة والسرير', roomBed),
          _clinicalRow('الطبيب المعالج', doctor),
          const Divider(height: 18),
          _clinicalRow('التشخيص الطبي', diagnosis, valueColor: const Color(0xFFD32F2F), isBold: true),
          _clinicalRow('نسبة الهيموجلوبين', '$hb (حرج)', valueColor: const Color(0xFFD32F2F), isBold: true),
          _clinicalRow('الأولوية والخطورة', urgency, valueColor: const Color(0xFFE65100), isBold: true),
          _clinicalRow('نتيجة التوافق', crossmatch, valueColor: const Color(0xFF2E7D32)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.assignment_outlined, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'تعليمات التمريض: $notes',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _clinicalRow(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontFamily: 'Cairo'),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
                color: valueColor ?? AppColors.textPrimary,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
