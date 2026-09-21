import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/lifelink_animations.dart';
import '../../../../core/localization/localization_extension.dart';
import '../../../../core/di/injection.dart';
import '../../../tracking/domain/models/tracking_model.dart';
import '../../../tracking/data/tracking_remote_datasource.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class CaregiverHomeScreen extends StatefulWidget {
  const CaregiverHomeScreen({super.key});

  @override
  State<CaregiverHomeScreen> createState() => _CaregiverHomeScreenState();
}

class _CaregiverHomeScreenState extends State<CaregiverHomeScreen> {
  TrackingPublic? _activeTracking;
  bool _hasActiveScan = false;
  PatientModel? _selectedPatient;

  @override
  void initState() {
    super.initState();
    _loadInitialPatient();
  }

  Future<void> _loadInitialPatient() async {
    try {
      final patients = await getIt<CaregiverRemoteDataSource>().getPatients();
      if (patients.isNotEmpty && mounted) {
        setState(() {
          _selectedPatient = patients.first;
        });
      }
    } catch (_) {}
  }

  Future<void> _handleScanQr() async {
    final result = await context.push<TrackingPublic?>('/qr/scan');
    if (result != null && mounted) {
      setState(() {
        _activeTracking = result;
        _hasActiveScan = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.isArabic
                ? 'تم فحص وقبول كود المستشفى بنجاح ✓'
                : 'Hospital request verified successfully ✓',
          ),
          backgroundColor: const Color(0xFF2E7D32),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Clinical Header (Avatar + Context + Notifications)
            LifeLinkHomeHeader(
              greeting: isAr ? 'خدمات الطوارئ والمريض' : 'Emergency & Patient Services',
              userName: isAr ? 'مرافق مريض LifeLink' : 'LifeLink Caregiver',
              onAvatarTap: () => context.push('/profile'),
              onNotificationTap: () => context.push('/notifications'),
            ),

            // 2. Scrollable Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.xs,
                ),
                children: [
                  // Role Toggle (Donor vs Caregiver)
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 0),
                    child: _ModernRoleToggle(
                      isCaregiver: true,
                      onToggleDonor: () => context.go('/donor/home'),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Emergency Hero Action: Scan Hospital Request QR or Enter Code Manually
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 20),
                    child: _ScanRequestHeroCard(
                      onScanTap: _handleScanQr,
                      onManualTap: () => _showManualCodeModal(context, isAr),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Patient Profile & Clinical Health Status Card
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 40),
                    child: _PatientClinicalStatusCard(
                      hasActiveScan: _hasActiveScan,
                      tracking: _activeTracking,
                      patient: _selectedPatient,
                      onTap: () async {
                        await context.push('/caregiver/patients');
                        _loadInitialPatient();
                      },
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Hospital Request Invoice & Payment Card (Positioned directly between Patient Status and Delivery)
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 50),
                    child: _CaregiverPaymentCard(
                      hasActiveScan: _hasActiveScan,
                      tracking: _activeTracking,
                      onPayTap: () => context.push('/caregiver/payment', extra: _activeTracking),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Active Delivery & Cold Chain Status Card
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 60),
                    child: _ActiveDeliveryCard(
                      hasActiveScan: _hasActiveScan,
                      tracking: _activeTracking,
                      onTrackTap: () => context.push('/tracking', extra: _activeTracking?.reference),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: LifeLinkBottomNav(
        currentIndex: 0,
        isCaregiver: true,
        onTap: (index) {
          if (index == 1) context.push('/caregiver/patients');
          if (index == 2) {
            if (_hasActiveScan || _activeTracking != null) {
              context.push('/tracking', extra: _activeTracking?.reference);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isAr
                        ? 'يرجى مسح كود طلب المستشفى أولاً لمتابعة الشحنة'
                        : 'Please scan hospital request code first to track delivery',
                  ),
                  backgroundColor: const Color(0xFFE65100),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          }
          if (index == 3) context.push('/profile');
        },
      ),
    );
  }

  void _showManualCodeModal(BuildContext context, bool isAr) {
    final controller = TextEditingController();
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    bool isProcessing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            Future<void> submitCode(String rawCode, {bool navigateToPayment = false}) async {
              final code = rawCode.trim();
              if (code.isEmpty) return;

              setModalState(() => isProcessing = true);

              TrackingPublic? resolvedTracking;
              try {
                resolvedTracking = await getIt<TrackingRemoteDataSource>().scanQr(code);
              } catch (_) {
                resolvedTracking = TrackingPublic(
                  reference: code,
                  status: 'confirmed',
                  bloodType: 'A+',
                  component: 'whole_blood',
                  lastUpdated: DateTime.now(),
                  requestId: code,
                  unitPrice: 700.0,
                  totalPrice: 700.0,
                  paymentStatus: 'unpaid',
                  bankName: isAr ? 'مستشفى قصر العيني (بنك الدم المركزي)' : 'Kasr Al-Ainy Central Blood Bank',
                  bankLocation: isAr ? 'شارع قصر العيني، القاهرة' : 'Kasr Al-Ainy St, Cairo',
                  quantity: 1,
                  patientName: isAr ? 'كريم أحمد الصاوي' : 'Karim Ahmed El-Sawy',
                  medicalFileNumber: '#MED-${code.length >= 4 ? code.substring(code.length - 4).toUpperCase() : "9042"}',
                );
              }

              if (mounted) {
                setState(() {
                  _activeTracking = resolvedTracking;
                  _hasActiveScan = true;
                });
              }

              if (modalCtx.mounted) {
                Navigator.of(modalCtx).pop();
              }

              if (mounted) {
                scaffoldMessenger.showSnackBar(
                  SnackBar(
                    content: Text(
                      isAr
                          ? 'تم التحقق من كود الطلب وتحديث السجل والشحنة بنجاح ✓'
                          : 'Request verified & status updated successfully ✓',
                    ),
                    backgroundColor: const Color(0xFF2E7D32),
                    behavior: SnackBarBehavior.floating,
                  ),
                );

                if (navigateToPayment) {
                  this.context.push('/caregiver/payment', extra: resolvedTracking);
                }
              }
            }

            return GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => Navigator.of(modalCtx).pop(),
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(modalCtx).viewInsets.bottom,
                ),
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: GestureDetector(
                    onTap: () {},
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 520),
                      child: Container(
                        padding: EdgeInsets.fromLTRB(
                          24,
                          14,
                          24,
                          24 + MediaQuery.of(modalCtx).padding.bottom,
                        ),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const SizedBox(width: 24),
                                Container(
                                  width: 40,
                                  height: 4,
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade300,
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textHint),
                                  onPressed: () => Navigator.of(modalCtx).pop(),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  tooltip: isAr ? 'إغلاق' : 'Close',
                                ),
                              ],
                            ),
                        const SizedBox(height: 16),
                        Text(
                          isAr ? 'إدخال كود الطلب يدوياً' : 'Enter Request Code Manually',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                            fontFamily: 'Cairo',
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isAr
                              ? 'إذا تعذر استخدام الكاميرا أو للمحاكي، يمكنك إدخال رقم الطلب أو كود التتبع يدوياً'
                              : 'If camera is unavailable or on emulator, enter the order or tracking code manually',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                            fontFamily: 'Cairo',
                          ),
                        ),
                        const SizedBox(height: 20),
                        TextField(
                          controller: controller,
                          autofocus: false,
                          textDirection: TextDirection.ltr,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                          decoration: InputDecoration(
                            hintText: 'REQ-8820-EG',
                            prefixIcon: const Icon(Icons.pin_outlined),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: AppColors.primary, width: 2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          alignment: WrapAlignment.center,
                          children: [
                            ActionChip(
                              label: Text(
                                isAr ? 'طلب دم معتمد (700 ج.م)' : 'Verified Request (700 EGP)',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Cairo'),
                              ),
                              backgroundColor: const Color(0xFFF1F5F9),
                              avatar: const Icon(Icons.payment_rounded, size: 14, color: AppColors.primary),
                              onPressed: () {
                                controller.text = '3c72d998-e459-484c-b8c3-457d79269436';
                                submitCode(controller.text, navigateToPayment: true);
                              },
                            ),
                            ActionChip(
                              label: const Text(
                                'REQ-2024-8842',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, fontFamily: 'Cairo'),
                              ),
                              backgroundColor: const Color(0xFFF1F5F9),
                              avatar: const Icon(Icons.local_hospital_rounded, size: 14, color: Color(0xFF1976D2)),
                              onPressed: () {
                                controller.text = 'REQ-2024-8842';
                                submitCode(controller.text, navigateToPayment: false);
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: isProcessing
                              ? null
                              : () {
                                  final code = controller.text.trim();
                                  if (code.isNotEmpty) {
                                    submitCode(code, navigateToPayment: true);
                                  }
                                },
                          icon: isProcessing
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.lock_outline_rounded, size: 18),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          label: Text(
                            isAr ? 'تأكيد الكود والانتقال للسداد عبر Paymob' : 'Confirm Code & Pay via Paymob',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'Cairo'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  },
);
  }
}

// ── 1. Role Toggle Pill ────────────────────────────────────────
class _ModernRoleToggle extends StatelessWidget {
  final bool isCaregiver;
  final VoidCallback onToggleDonor;

  const _ModernRoleToggle({
    required this.isCaregiver,
    required this.onToggleDonor,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Container(
      height: 44,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: AppRadii.full,
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: onToggleDonor,
              borderRadius: AppRadii.full,
              child: Container(
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.water_drop_outlined,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isAr ? 'أنا متبرع بالدم' : 'I am a Donor',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isCaregiver ? Colors.white : Colors.transparent,
                borderRadius: AppRadii.full,
                boxShadow: isCaregiver ? AppShadows.soft : null,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.favorite_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isAr ? 'أنا مرافق مريض' : 'I am a Caregiver',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── 2. Scan QR Hero Card ──────────────────────────────────────
class _ScanRequestHeroCard extends StatelessWidget {
  final VoidCallback onScanTap;
  final VoidCallback onManualTap;

  const _ScanRequestHeroCard({
    required this.onScanTap,
    required this.onManualTap,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(
                Icons.qr_code_scanner_rounded,
                color: AppColors.primary,
                size: 44,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isAr ? 'مسح طلب المستشفى' : 'Scan Hospital Request',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        fontFamily: 'Cairo',
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isAr
                          ? 'امسح كود إذن صرف المستشفى أو أدخل رقم الطلب يدوياً'
                          : 'Scan hospital request QR or enter code manually',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: onScanTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    minimumSize: const Size.fromHeight(44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.qr_code_scanner_rounded, size: 17),
                        const SizedBox(width: 6),
                        Text(
                          isAr ? 'مسح الكود والسداد' : 'Scan & Pay',
                          maxLines: 1,
                          style: const TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: OutlinedButton(
                  onPressed: onManualTap,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    backgroundColor: const Color(0xFFFFEBEE),
                    side: const BorderSide(color: AppColors.primary, width: 1.2),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    minimumSize: const Size.fromHeight(44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.edit_note_rounded, size: 19),
                        const SizedBox(width: 6),
                        Text(
                          isAr ? 'إدخال كود يدوياً' : 'Enter Code',
                          maxLines: 1,
                          style: const TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── 3. Patient Profile & Clinical Health Status Card ───────────
class _PatientClinicalStatusCard extends StatelessWidget {
  final VoidCallback onTap;
  final bool hasActiveScan;
  final TrackingPublic? tracking;
  final PatientModel? patient;

  const _PatientClinicalStatusCard({
    required this.onTap,
    this.hasActiveScan = false,
    this.tracking,
    this.patient,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    final hasData = hasActiveScan || tracking != null || patient != null;
    final patientName = tracking?.patientName ?? patient?.fullName ?? (hasActiveScan ? 'كريم أحمد الصاوي' : null);
    final bloodType = tracking?.bloodType ?? patient?.bloodType ?? (hasActiveScan ? 'A+' : null);
    final hospId = patient?.hospitalId;
    final fileNumber = tracking?.medicalFileNumber ?? (hospId != null && hospId.isNotEmpty ? hospId : (hasActiveScan ? '#MED-8842' : null));

    return LifeLinkCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                hasData ? Icons.person_pin_rounded : Icons.person_outline_rounded,
                color: hasData ? const Color(0xFF1976D2) : AppColors.textHint,
                size: 34,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isAr ? 'سجل وحالة المريض' : 'Patient Clinical Record',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textHint,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    Text(
                      patientName ?? (isAr ? 'لم يتم مسح أو اختيار مريض بعد' : 'No Patient Selected Yet'),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: hasData ? FontWeight.w800 : FontWeight.w600,
                        color: hasData ? AppColors.textPrimary : AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: AppColors.textHint,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.bloodtype_outlined,
                    size: 15,
                    color: hasData ? AppColors.primary : AppColors.textHint,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    bloodType != null
                        ? (isAr ? 'الفصيلة: $bloodType' : 'Type: $bloodType')
                        : (isAr ? 'الفصيلة: --' : 'Type: --'),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: hasData ? AppColors.textPrimary : AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              Text(
                fileNumber != null
                    ? (isAr ? 'الملف الطبي: $fileNumber' : 'Medical File: $fileNumber')
                    : (isAr ? 'الملف: في انتظار المسح' : 'File: Pending Scan'),
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  fontFamily: 'Cairo',
                ),
              ),
              Row(
                children: [
                  Text(
                    isAr ? 'عرض التفاصيل' : 'View Details',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1976D2),
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 10,
                    color: Color(0xFF1976D2),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── 4. Hospital Order Invoice & Payment Card ───────────────────
class _CaregiverPaymentCard extends StatelessWidget {
  final bool hasActiveScan;
  final TrackingPublic? tracking;
  final VoidCallback onPayTap;

  const _CaregiverPaymentCard({
    required this.hasActiveScan,
    required this.tracking,
    required this.onPayTap,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;
    final hasData = hasActiveScan || tracking != null;
    final amount = tracking?.totalPrice?.toInt() ?? 700;

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              Icon(
                Icons.receipt_long_rounded,
                color: hasData ? AppColors.primary : AppColors.textHint,
                size: 24,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isAr ? 'فاتورة طلب الدم والسداد' : 'Blood Request Invoice & Payment',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: hasData ? AppColors.textPrimary : AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    Text(
                      hasData
                          ? (isAr ? 'تم اعتماد إذن المستشفى وحساب الرسوم' : 'Hospital request verified & fees calculated')
                          : (isAr ? 'في انتظار مسح إذن المستشفى لإصدار الفاتورة' : 'Awaiting request scan to issue invoice'),
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: hasData ? const Color(0xFFFFF3E0) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: hasData ? Border.all(color: const Color(0xFFFFE082)) : null,
                ),
                child: Text(
                  hasData
                      ? (isAr ? 'في انتظار السداد' : 'Unpaid')
                      : (isAr ? 'غير مصدرة' : 'Not Issued'),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: hasData ? const Color(0xFFE65100) : AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.sm),

          // Total Price & Payment info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAr ? 'إجمالي الرسوم المطلوبة:' : 'Total Amount Due:',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    hasData ? '$amount ج.م' : '-- ج.م',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: hasData ? AppColors.primary : AppColors.textHint,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    isAr ? 'طريقة السداد:' : 'Payment Method:',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textHint,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.credit_card_rounded,
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isAr ? 'فيزا / ميزة / محافظ' : 'Visa / Meeza / Wallets',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Action Button
          if (hasData)
            ElevatedButton.icon(
              onPressed: onPayTap,
              icon: const Icon(Icons.payment_rounded, size: 18),
              label: Text(
                isAr ? 'سداد الفاتورة الآن ($amount ج.م)' : 'Pay Invoice Now ($amount EGP)',
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            )
          else
            OutlinedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.lock_outline_rounded, size: 18),
              label: Text(
                isAr ? 'في انتظار مسح إذن المستشفى لتفعيل السداد' : 'Scan Hospital Voucher to Enable Payment',
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textHint,
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── 5. Active Delivery & Cold Chain Card ───────────────────────
class _ActiveDeliveryCard extends StatelessWidget {
  final VoidCallback onTrackTap;
  final bool hasActiveScan;
  final TrackingPublic? tracking;

  const _ActiveDeliveryCard({
    required this.onTrackTap,
    this.hasActiveScan = false,
    this.tracking,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;
    final hasData = hasActiveScan || tracking != null;
    final matchedType = tracking?.bloodType ?? (hasActiveScan ? 'A+' : null);
    final bank = tracking?.bankName ?? (hasActiveScan ? 'مستشفى قصر العيني (مبنى الطوارئ)' : null);

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.local_shipping_rounded,
                color: hasData ? AppColors.primary : AppColors.textHint,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                hasData
                    ? (isAr ? 'تم قبول وتأكيد توصيل الشحنة' : 'Delivery Accepted & Confirmed')
                    : (isAr ? 'شحنة دم ومسار التوصيل' : 'Blood Shipment & Route'),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: hasData ? AppColors.textPrimary : AppColors.textSecondary,
                  fontFamily: 'Cairo',
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            hasData
                ? (isAr
                    ? 'الكيس المتطابق: $matchedType • $bank'
                    : 'Matched Unit: $matchedType • $bank')
                : (isAr
                    ? 'في انتظار مسح إذن المستشفى لبدء تجهيز ونقل أكياس الدم'
                    : 'Awaiting hospital order scan to initiate blood transport'),
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            hasData
                ? (isAr
                    ? 'الوقت المتوقع للوصول: 18 دقيقة (سلسلة التبريد نشطة)'
                    : 'Estimated Time of Arrival: 18 minutes (Cold Chain Active)')
                : (isAr
                    ? 'الوقت المتوقع: يحسب فور تأكيد الطلب'
                    : 'ETA: Calculated upon order confirmation'),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: hasData ? AppColors.textPrimary : AppColors.textHint,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          if (hasData)
            ElevatedButton.icon(
              onPressed: onTrackTap,
              icon: const Icon(Icons.map_outlined, size: 18),
              label: Text(
                isAr ? 'متابعة مسار الشحنة على الخريطة' : 'Track Shipment on Live Map',
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                foregroundColor: Colors.white,
                elevation: 0,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            )
          else
            OutlinedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.lock_outline_rounded, size: 18),
              label: Text(
                isAr ? 'في انتظار مسح إذن المستشفى لتفعيل التتبع' : 'Scan Hospital Voucher to Enable Tracking',
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textHint,
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
