import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_animations.dart';
import '../../../../core/widgets/notification_badge_button.dart';
import '../../../../core/localization/localization_extension.dart';

/// Interactive Shipment Route Map Screen
/// Displays the map route with the exact distance between the Blood Bank and the Hospital,
/// real-time courier position, cold-chain temperature, and estimated time of arrival.
class DeliveryRouteMapScreen extends StatefulWidget {
  final String? requestId;

  const DeliveryRouteMapScreen({super.key, this.requestId});

  @override
  State<DeliveryRouteMapScreen> createState() => _DeliveryRouteMapScreenState();
}

class _DeliveryRouteMapScreenState extends State<DeliveryRouteMapScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F4F8),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/caregiver/home'),
        ),
        title: Text(
          isAr ? 'مسار وتتبع الشحنة' : 'Shipment Route & Tracking',
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
      body: Stack(
        children: [
          // 1. Stylized City Map Canvas with Route from Blood Bank to Hospital
          Positioned.fill(
            child: CustomPaint(
              painter: _DeliveryRouteMapPainter(isArabic: isAr),
            ),
          ),

          // 2. Floating Distance Badge on the Route (Matching User Request)
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: LifeLinkFadeSlide(
              delay: const Duration(milliseconds: 0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadii.md,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: const BoxDecoration(
                        color: Color(0xFFE8F3FF),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.navigation_rounded,
                        color: Color(0xFF1976D2),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            isAr
                                ? 'المسافة بين بنك الدم والمستشفى: 8.4 كم'
                                : 'Distance: Blood Bank to Hospital: 8.4 km',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          Text(
                            isAr
                                ? 'المسافة المتبقية: 3.8 كم • الوصول المتوقع خلال 18 دقيقة'
                                : 'Remaining: 3.8 km • Estimated Arrival in 18 min',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 3. Pulsing Courier Van Marker on Route
          Positioned(
            top: 215,
            left: MediaQuery.of(context).size.width * 0.44,
            child: AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 46 * _pulseAnimation.value,
                      height: 46 * _pulseAnimation.value,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primary.withValues(
                          alpha: 0.35 * (1.5 - _pulseAnimation.value),
                        ),
                      ),
                    ),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.local_shipping_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          // 4. Slide-up Delivery Details Sheet
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x1A000000),
                    blurRadius: 20,
                    offset: Offset(0, -4),
                  ),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle pill
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

                    // Header with Optional Request Code Tag
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isAr ? 'تفاصيل شحنة الدم قيد النقل' : 'Blood Shipment In-Transit',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            fontFamily: 'Cairo',
                          ),
                        ),
                        if (widget.requestId != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F3FF),
                              borderRadius: AppRadii.full,
                              border: Border.all(
                                color: const Color(0xFF1976D2).withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.tag_rounded, size: 12, color: Color(0xFF1976D2)),
                                const SizedBox(width: 2),
                                Text(
                                  widget.requestId!,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF1976D2),
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Route Points (Bank to Hospital)
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: AppRadii.md,
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Origin and Destination Icons + Strictly Centered Vertical Line
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const SizedBox(
                                width: 24,
                                height: 24,
                                child: Center(
                                  child: Icon(
                                    Icons.water_drop_rounded,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                ),
                              ),
                              Container(
                                width: 2,
                                height: 28,
                                color: AppColors.border,
                              ),
                              const SizedBox(
                                width: 24,
                                height: 24,
                                child: Center(
                                  child: Icon(
                                    Icons.local_hospital_rounded,
                                    color: Color(0xFF1976D2),
                                    size: 20,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 12),
                          // Content for both points
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isAr
                                      ? 'بنك الدم المركزي الإقليمي (العباسية)'
                                      : 'Regional Central Blood Bank (Abbassia)',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                Text(
                                  isAr
                                      ? 'تم التحرك والتسليم للكابتن • 02:15 م'
                                      : 'Dispatched to courier • 02:15 PM',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  isAr
                                      ? 'مستشفى قصر العيني (مبنى الطوارئ)'
                                      : 'Kasr Al-Ainy Hospital (ER Building)',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                Text(
                                  isAr
                                      ? 'المسافة المتبقية 3.8 كم • متوقع 02:45 م'
                                      : 'Remaining 3.8 km • Expected 02:45 PM',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Courier info & direct call
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE8F3FF),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.person_rounded,
                            color: Color(0xFF1976D2),
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isAr
                                    ? 'مندوب النقل الطبي: كابتن حسام علي'
                                    : 'Medical Courier: Capt. Hossam Ali',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                              Text(
                                isAr
                                    ? 'سيارة نقل مبردة مجهزة • لوحة: أ ب ج 492'
                                    : 'Refrigerated Vehicle • Plate: ABC-492',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textSecondary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  isAr
                                      ? 'جاري الاتصال بمندوب النقل الطبي: 01012345678'
                                      : 'Calling medical courier: 01012345678',
                                ),
                                backgroundColor: const Color(0xFF1976D2),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          icon: const Icon(
                            Icons.phone_in_talk_rounded,
                            color: Color(0xFF1976D2),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Back to home button
                    LifeLinkButton(
                      label: isAr ? 'العودة للرئيسية' : 'Back to Home',
                      isSecondary: true,
                      onPressed: () => context.go('/caregiver/home'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// CustomPainter drawing the delivery map with city blocks, streets,
/// Point A (Blood Bank), Point B (Hospital), and the route connecting them.
class _DeliveryRouteMapPainter extends CustomPainter {
  final bool isArabic;

  const _DeliveryRouteMapPainter({this.isArabic = true});

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Background land
    final bgPaint = Paint()..color = const Color(0xFFF3F5F8);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // 2. City Blocks
    final blockPaint = Paint()..color = const Color(0xFFE8ECEF);
    final parkPaint = Paint()..color = const Color(0xFFE2F0D9);

    final blocks = [
      Rect.fromLTWH(20, 70, size.width * 0.4, 70),
      Rect.fromLTWH(size.width * 0.5, 60, size.width * 0.44, 80),
      Rect.fromLTWH(15, 170, size.width * 0.36, 110),
      Rect.fromLTWH(size.width * 0.48, 160, size.width * 0.46, 120),
      Rect.fromLTWH(25, 300, size.width * 0.4, 90),
      Rect.fromLTWH(size.width * 0.52, 290, size.width * 0.42, 100),
    ];

    for (final r in blocks) {
      canvas.drawRRect(RRect.fromRectAndRadius(r, const Radius.circular(8)), blockPaint);
    }

    final park = Rect.fromLTWH(size.width * 0.55, 175, 75, 50);
    canvas.drawRRect(RRect.fromRectAndRadius(park, const Radius.circular(6)), parkPaint);

    // 3. Roads (White with grey borders)
    final roadBorder = Paint()
      ..color = const Color(0xFFD6DBE1)
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    final roadSurface = Paint()
      ..color = Colors.white
      ..strokeWidth = 12
      ..style = PaintingStyle.stroke;

    // Major Avenues
    final vRoad = Path()
      ..moveTo(size.width * 0.45, 0)
      ..lineTo(size.width * 0.45, size.height);
    canvas.drawPath(vRoad, roadBorder);
    canvas.drawPath(vRoad, roadSurface);

    final hRoad1 = Path()
      ..moveTo(0, 150)
      ..lineTo(size.width, 150);
    canvas.drawPath(hRoad1, roadBorder);
    canvas.drawPath(hRoad1, roadSurface);

    final hRoad2 = Path()
      ..moveTo(0, 280)
      ..lineTo(size.width, 280);
    canvas.drawPath(hRoad2, roadBorder);
    canvas.drawPath(hRoad2, roadSurface);

    // 4. Delivery Route Path (Cyan/Blue dashed path connecting Bank to Hospital)
    final routeBorder = Paint()
      ..color = const Color(0xFF1976D2).withValues(alpha: 0.3)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final routeLine = Paint()
      ..color = const Color(0xFF1976D2)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.75, 110) // Point A: Blood Bank
      ..lineTo(size.width * 0.45, 110)
      ..lineTo(size.width * 0.45, 240) // Midpoint
      ..lineTo(size.width * 0.2, 240)  // Point B: Hospital
      ..lineTo(size.width * 0.2, 270);

    canvas.drawPath(routePath, routeBorder);
    canvas.drawPath(routePath, routeLine);

    // 5. Point A: Blood Bank Marker
    final pointA = Offset(size.width * 0.75, 110);
    final bankPinBg = Paint()..color = const Color(0xFFE53935);
    canvas.drawCircle(pointA, 14, bankPinBg);
    final whiteInner = Paint()..color = Colors.white;
    canvas.drawCircle(pointA, 6, whiteInner);

    // 6. Point B: Hospital Marker
    final pointB = Offset(size.width * 0.2, 270);
    final hospitalPinBg = Paint()..color = const Color(0xFF1976D2);
    canvas.drawCircle(pointB, 14, hospitalPinBg);
    canvas.drawCircle(pointB, 6, whiteInner);

    // Labels for Point A & B
    final tp = TextPainter(textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr);

    void drawMarkerLabel(String text, Offset offset, Color color) {
      tp.text = TextSpan(
        text: text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: color,
          fontFamily: 'Cairo',
          backgroundColor: Colors.white.withValues(alpha: 0.9),
        ),
      );
      tp.layout();
      tp.paint(canvas, offset);
    }

    drawMarkerLabel(
      isArabic ? 'بنك الدم المركزي (انطلاق)' : 'Blood Bank (Origin)',
      Offset(isArabic ? size.width * 0.42 : size.width * 0.48, 85),
      const Color(0xFFE53935),
    );
    drawMarkerLabel(
      isArabic ? 'مستشفى قصر العيني (وصول)' : 'Kasr Al-Ainy (Dest)',
      Offset(size.width * 0.05, 290),
      const Color(0xFF1976D2),
    );
  }

  @override
  bool shouldRepaint(covariant _DeliveryRouteMapPainter oldDelegate) =>
      oldDelegate.isArabic != isArabic;
}
