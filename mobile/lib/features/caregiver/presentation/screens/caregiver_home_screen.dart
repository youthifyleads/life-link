import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/lifelink_animations.dart';
import '../../../../core/localization/localization_extension.dart';

class CaregiverHomeScreen extends StatelessWidget {
  const CaregiverHomeScreen({super.key});

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
                      onScanTap: () => context.push('/qr/scan'),
                      onManualTap: () => _showManualCodeModal(context),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Patient Profile & Clinical Health Status Card (سجل المريض وحالته الصحية)
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 40),
                    child: _PatientClinicalStatusCard(
                      onTap: () => context.push('/caregiver/patients'),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Active Delivery & Cold Chain Status Card
                  LifeLinkFadeSlide(
                    delay: const Duration(milliseconds: 60),
                    child: _ActiveDeliveryCard(
                      onTrackTap: () => context.push('/tracking'),
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
        onTap: (index) {
          if (index == 1) context.push('/caregiver/request-blood');
          if (index == 2) context.push('/tracking');
          if (index == 3) context.push('/profile');
        },
      ),
    );
  }

  void _showManualCodeModal(BuildContext context) {
    final controller = TextEditingController();
    final isAr = context.isArabic;
    String? errorText;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                MediaQuery.of(modalCtx).viewInsets.bottom + AppSpacing.xl,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      const Icon(
                        Icons.edit_note_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isAr ? 'إدخال كود الطلب يدوياً' : 'Enter Request Code Manually',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAr
                        ? 'أدخل رقم الطلب المطبوع على إذن المستشفى لمتابعة مسار الشحنة'
                        : 'Enter the order number printed on the hospital voucher to track shipment',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Quick Suggestion Chips for Fast Testing
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      ActionChip(
                        label: const Text('طلب دم معتمد (700 ج.م - Paymob)',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Cairo')),
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: const BorderSide(color: AppColors.primary),
                        avatar: const Icon(Icons.payment_rounded, size: 14, color: AppColors.primary),
                        onPressed: () {
                          setModalState(() {
                            controller.text = '3c72d998-e459-484c-b8c3-457d79269436';
                            errorText = null;
                          });
                        },
                      ),
                      ActionChip(
                        label: const Text('REQ-2024-8842', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'Cairo')),
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                        avatar: const Icon(Icons.touch_app_rounded, size: 14, color: Color(0xFF1976D2)),
                        onPressed: () {
                          setModalState(() {
                            controller.text = 'REQ-2024-8842';
                            errorText = null;
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: AppRadii.md,
                      border: Border.all(
                        color: errorText != null ? AppColors.error : AppColors.border,
                        width: errorText != null ? 1.5 : 1.0,
                      ),
                    ),
                    child: TextField(
                      controller: controller,
                      autofocus: false,
                      textCapitalization: TextCapitalization.characters,
                      onChanged: (_) {
                        if (errorText != null) {
                          setModalState(() => errorText = null);
                        }
                      },
                      decoration: InputDecoration(
                        hintText: isAr ? 'مثال: REQ-2024-8842' : 'e.g. REQ-2024-8842',
                        hintStyle: const TextStyle(
                          color: AppColors.textHint,
                          fontSize: 13,
                          fontFamily: 'Cairo',
                        ),
                        prefixIcon: const Icon(
                          Icons.tag_rounded,
                          color: AppColors.primary,
                          size: 20,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                      ),
                    ),
                  ),
                  if (errorText != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      errorText!,
                      style: const TextStyle(
                        color: AppColors.error,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.lg),
                  LifeLinkButton(
                    label: isAr ? 'الانتقال للسداد عبر Paymob (700 ج.م)' : 'Pay via Paymob (700 EGP)',
                    icon: Icons.lock_outline_rounded,
                    onPressed: () {
                      final code = controller.text.trim();
                      if (code.isEmpty) {
                        setModalState(() {
                          errorText = isAr
                              ? 'يرجى إدخال كود الطلب أولاً'
                              : 'Please enter the request code';
                        });
                        return;
                      }

                      Navigator.of(modalCtx).pop();
                      context.push('/caregiver/payment');
                    },
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  LifeLinkButton(
                    label: isAr ? 'تأكيد والبحث عن الشحنة' : 'Confirm & Track Shipment',
                    isSecondary: true,
                    icon: Icons.search_rounded,
                    onPressed: () {
                      final code = controller.text.trim();
                      if (code.isEmpty) {
                        setModalState(() {
                          errorText = isAr
                              ? 'يرجى إدخال كود الطلب أولاً'
                              : 'Please enter the request code';
                        });
                        return;
                      }

                      Navigator.of(modalCtx).pop();
                      context.push('/tracking', extra: code);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            isAr
                                ? 'جاري تتبع مسار الشحنة للطلب: $code'
                                : 'Tracking delivery route for: $code',
                          ),
                          backgroundColor: AppColors.navy,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ],
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
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            isAr ? 'مسح طلب المستشفى وسداد Paymob' : 'Scan Request & Pay via Paymob',
                            style: const TextStyle(
                              fontSize: 15.5,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              fontFamily: 'Cairo',
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Paymob',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isAr
                          ? 'امسح كود إذن صرف المستشفى لمعاينة الفاتورة والسداد بـ Paymob وتتبع المسار'
                          : 'Scan hospital blood request QR to pay via Paymob and track delivery',
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
                child: LifeLinkButton(
                  label: isAr ? 'مسح الكود والسداد' : 'Scan & Pay',
                  icon: Icons.camera_alt_rounded,
                  onPressed: onScanTap,
                  height: 44,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: LifeLinkButton(
                  label: isAr ? 'إدخال كود يدوياً' : 'Enter Code',
                  isSecondary: true,
                  icon: Icons.edit_note_rounded,
                  onPressed: onManualTap,
                  height: 44,
                  fontSize: 13,
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

  const _PatientClinicalStatusCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return LifeLinkCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.person_pin_rounded,
                color: Color(0xFF1976D2),
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
                      isAr ? 'أحمد محمود السعيد' : 'Ahmed Mahmoud El-Saeed',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
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
                  const Icon(
                    Icons.bloodtype_outlined,
                    size: 15,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isAr ? 'الفصيلة: A+' : 'Type: A+',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              Text(
                isAr ? 'الملف الطبي: #MED-9042' : 'Medical File: #MED-9042',
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

// ── 4. Active Delivery & Cold Chain Card ───────────────────────
class _ActiveDeliveryCard extends StatelessWidget {
  final VoidCallback onTrackTap;

  const _ActiveDeliveryCard({required this.onTrackTap});

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.local_shipping_rounded,
                color: AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                isAr ? 'شحنة دم قيد التوصيل الآن' : 'Blood Shipment In-Transit',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            isAr
                ? 'الكيس المتطابق: A+ • مستشفى قصر العيني (مبنى الطوارئ)'
                : 'Matched Unit: A+ • Kasr Al-Ainy Hospital (ER Building)',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            isAr
                ? 'الوقت المتوقع للوصول: 18 دقيقة'
                : 'Estimated Time of Arrival: 18 minutes',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          LifeLinkButton(
            label: isAr ? 'متابعة مسار الشحنة على الخريطة' : 'Track Shipment on Live Map',
            isSecondary: true,
            icon: Icons.map_outlined,
            onPressed: onTrackTap,
            height: 42,
          ),
        ],
      ),
    );
  }
}
