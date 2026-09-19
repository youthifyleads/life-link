import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/localization/localization_extension.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/notification_badge_button.dart';

/// Screen matching the "Donation Request" phone screen in reference image 2:
/// - Red App Bar with "Donation Request"
/// - Hospital photo banner with rounded corners
/// - Hospital Title, "Created by: Dr. ...", Date, and Address
/// - Event Details card (Time, Location)
/// - Awareness & Medical Impact copy ("Donation can help save up to three lives...", "Process takes about 30 mins")
/// - Interactive State Button: Red "Confirm" -> Green "Confirmed ✓"
class DonationRequestScreen extends StatefulWidget {
  final Map<String, dynamic>? requestData;

  const DonationRequestScreen({super.key, this.requestData});

  @override
  State<DonationRequestScreen> createState() => _DonationRequestScreenState();
}

class _DonationRequestScreenState extends State<DonationRequestScreen> {
  bool _isConfirmed = false;

  @override
  void initState() {
    super.initState();
    _isConfirmed = widget.requestData?['isConfirmed'] == true;
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;
    final hospital = widget.requestData?['hospital'] as String? ??
        widget.requestData?['title'] as String? ??
        (isAr ? 'مستشفى قصر العيني - بنك الدم' : 'Kasr Al-Ainy Hospital - Blood Bank');
    final doctor = widget.requestData?['doctor'] as String? ?? (isAr ? 'د. أحمد فؤاد' : 'Dr. Ahmed Fouad');
    final date = widget.requestData?['date'] as String? ?? (isAr ? '15 يونيو 2024' : 'June 15, 2024');
    final time = widget.requestData?['time'] as String? ?? (isAr ? '10:00 ص إلى 07:00 م' : '10:00 AM to 07:00 PM');
    final address = widget.requestData?['address'] as String? ??
        (isAr ? 'شارع قصر العيني، المنيل، القاهرة' : 'Kasr Al-Ainy St, Manial, Cairo');
    final bloodType = widget.requestData?['bloodType'] as String? ?? 'B+';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        context.pop(_isConfirmed);
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.primary,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
            onPressed: () => context.pop(_isConfirmed),
          ),
          title: Text(
            isAr ? 'طلب التبرع' : 'Donation Request',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              fontFamily: 'Cairo',
            ),
          ),
          actions: const [
            NotificationBadgeButton(),
            SizedBox(width: 8),
          ],
        ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Hospital Photo / Medical Hero Banner (Matching Reference Image 2)
            ClipRRect(
              borderRadius: AppRadii.lg,
              child: Container(
                height: 160,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E293B), Color(0xFF334155)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Stack(
                  children: [
                    // Stylized architectural building background
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _HospitalBuildingPainter(),
                      ),
                    ),
                    // Glassmorphic overlay badge
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          borderRadius: AppRadii.full,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified_rounded,
                              color: AppColors.teal,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isAr ? 'مركز دم معتمد' : 'Verified Center',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Floating Blood type badge on banner
                    Positioned(
                      bottom: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: AppRadii.full,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.4),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          isAr ? 'الفصيلة المطلوبة: $bloodType' : 'Required: $bloodType',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'Cairo',
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // 2. Hospital & Doctor Info (Matching Reference)
            Text(
              hospital,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                fontFamily: 'Cairo',
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  isAr ? 'بواسطة: $doctor' : 'By: $doctor',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
                const SizedBox(width: 12),
                const Icon(Icons.calendar_today_rounded, size: 13, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_rounded, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    address,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // 3. Event Details Card (Matching Reference: "Event Details")
            LifeLinkCard(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAr ? 'تفاصيل الموعد والحدث' : 'Event & Appointment Details',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: Color(0xFFE8F3FF),
                          borderRadius: AppRadii.md,
                        ),
                        child: const Icon(
                          Icons.access_time_rounded,
                          color: Color(0xFF1976D2),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr ? 'المواعيد المتاحة' : 'Available Times',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textHint,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          Text(
                            time,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFFECEE),
                          borderRadius: AppRadii.md,
                        ),
                        child: const Icon(
                          Icons.local_hospital_rounded,
                          color: AppColors.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr ? 'مكان الاستقبال' : 'Reception Center',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textHint,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          Text(
                            hospital,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // 4. Awareness & Medical Info Card (Matching Reference Copy)
            LifeLinkCard(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: const BoxDecoration(
                          color: Color(0xFFEAF7EE),
                          borderRadius: AppRadii.full,
                        ),
                        child: const Icon(
                          Icons.volunteer_activism_rounded,
                          color: AppColors.teal,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        isAr ? 'لماذا تبرعك بالدم مهم؟' : 'Why Your Donation Matters',
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
                        ? 'تبرعك بوحدة دم واحدة ينقذ حتى 3 أرواح. الدم ضروري للعمليات الجراحية الدقيقة، الحوادث الطارئة، وعلاج مرضى الأورام وأمراض الدم.'
                        : 'A single blood donation saves up to 3 lives. Blood is critical for surgical procedures, emergency traumas, and oncology therapies.',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: AppRadii.md,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.timer_outlined,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            isAr
                                ? 'تستغرق عملية التبرع حوالي 20 إلى 30 دقيقة فقط وتتم بأعلى معايير التعقيم.'
                                : 'The donation process takes only 20-30 minutes under top sterile medical conditions.',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // 5. Interactive Action Button: "Confirm" (Red) -> "Confirmed ✓" (Green)
            // (Matching the two phone states side-by-side in reference Image 2)
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              child: LifeLinkButton(
                label: _isConfirmed
                    ? (isAr ? 'تم تأكيد حضورك بنجاح ✓' : 'Appointment Confirmed ✓')
                    : (isAr ? 'تأكيد الموعد والتبرع' : 'Confirm Appointment & Donate'),
                icon: _isConfirmed ? Icons.check_circle_rounded : Icons.calendar_today_rounded,
                backgroundColor: _isConfirmed ? const Color(0xFF2E7D32) : AppColors.primary,
                onPressed: () {
                  setState(() {
                    _isConfirmed = !_isConfirmed;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        _isConfirmed
                          ? (isAr
                              ? 'تم تأكيد موعدك بنجاح! شكراً لمساهمتك في إنقاذ الأرواح.'
                              : 'Donation appointment confirmed! Thank you for saving lives.')
                          : (isAr ? 'تم إلغاء تأكيد الموعد.' : 'Donation appointment cancelled.'),
                      ),
                      backgroundColor: _isConfirmed ? const Color(0xFF2E7D32) : AppColors.navy,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    ),
    );
  }
}

/// CustomPainter to draw a clean modern hospital facade graphic
class _HospitalBuildingPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.15);
    final winPaint = Paint()..color = Colors.white.withValues(alpha: 0.25);

    // Main building outline
    final mainRect = Rect.fromLTWH(size.width * 0.15, 30, size.width * 0.7, size.height);
    canvas.drawRect(mainRect, paint);

    // Windows grid
    for (double y = 45; y < size.height - 20; y += 22) {
      for (double x = size.width * 0.2; x < size.width * 0.8; x += 30) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(Rect.fromLTWH(x, y, 18, 12), const Radius.circular(2)),
          winPaint,
        );
      }
    }

    // Red Cross medical badge
    final crossPaint = Paint()..color = AppColors.primary.withValues(alpha: 0.8);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.48, 12, 14, 30),
        const Radius.circular(2),
      ),
      crossPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.48 - 8, 20, 30, 14),
        const Radius.circular(2),
      ),
      crossPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
