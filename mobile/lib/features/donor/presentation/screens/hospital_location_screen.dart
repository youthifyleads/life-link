import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/notification_badge_button.dart';

/// Screen matching Image 2, 3, & 4 in the reference designs:
/// - Stylized interactive city map canvas with roads, blocks, hospital pin, and pulsing marker
/// - Top floating hospital address card
/// - Bottom sheet with hospital title, tags ("Accepting Blood Donations", "Urgent"),
///   "Blood types needed" chips (O+, A+, AB+), and "I Want To Donate" ("أريد التبرع") button.
class HospitalLocationScreen extends StatefulWidget {
  final Map<String, dynamic>? hospitalData;

  const HospitalLocationScreen({super.key, this.hospitalData});

  @override
  State<HospitalLocationScreen> createState() => _HospitalLocationScreenState();
}

class _HospitalLocationScreenState extends State<HospitalLocationScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  bool _isDonated = false;

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
    final title = widget.hospitalData?['title'] as String? ??
        widget.hospitalData?['hospital'] as String? ??
        'مستشفى قصر العيني - مبنى الطوارئ G';
    final address = widget.hospitalData?['address'] as String? ??
        'شارع قصر العيني، مبنى الطوارئ، القاهرة';
    final bloodTypes = (widget.hospitalData?['bloodTypes'] as String? ?? 'O+  A+  AB+')
        .split(RegExp(r'\s+'))
        .where((s) => s.isNotEmpty)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF1F4F8),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/donor/home'),
        ),
        title: const Text(
          'موقع المستشفى',
          style: TextStyle(
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
          // 1. Stylized City Map Canvas (Matching Reference Images 3 & 4)
          Positioned.fill(
            child: CustomPaint(
              painter: _StylizedMapPainter(),
            ),
          ),

          // 2. Pulsing Pin & Floating Top Address Callout (Matching Reference)
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Floating Address Callout Card
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppRadii.md,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          fontFamily: 'Cairo',
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        address,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondary,
                          fontFamily: 'Cairo',
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Pulsing Red Location Pin Marker
                AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 44 * _pulseAnimation.value,
                          height: 44 * _pulseAnimation.value,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primary.withValues(
                              alpha: 0.3 * (1.5 - _pulseAnimation.value),
                            ),
                          ),
                        ),
                        Container(
                          width: 28,
                          height: 28,
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
                            Icons.location_on_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 120), // Offset to position pin gracefully above bottom sheet
              ],
            ),
          ),

          // 3. Floating Map Controls (GPS Re-center & Zoom)
          Positioned(
            left: 16,
            top: 20,
            child: Column(
              children: [
                _MapControlButton(
                  icon: Icons.my_location_rounded,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('تم تحديد موقع المستشفى الأقرب إليك'),
                        duration: Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.directions_rounded,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('جاري فتح الاتجاهات في تطبيق الخرائط...'),
                        duration: Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),

          // 4. Slide-up Detail Bottom Card (Matching Reference Images 3 & 4)
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
                    // Pull Handle Indicator
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

                    // Hospital Title
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: 2),

                    // Address subtitle
                    Text(
                      address,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Status Badges Row: "Accepting Blood Donations" + "Urgent"
                    Row(
                      children: [
                        // 1. Accepting Blood Donations (Light Blue Pill)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFE8F3FF),
                            borderRadius: AppRadii.full,
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_circle_rounded,
                                size: 13,
                                color: Color(0xFF1976D2),
                              ),
                              SizedBox(width: 4),
                              Text(
                                'متاح استقبال متبرعين',
                                style: TextStyle(
                                  color: Color(0xFF1976D2),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),

                        // 2. Urgent Badge (Light Red Pill)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFECEE),
                            borderRadius: AppRadii.full,
                          ),
                          child: const Text(
                            'عاجل جداً',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // "Blood types needed" / "فصائل الدم المطلوبة"
                    const Text(
                      'فصائل الدم المطلوبة:',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),

                    // Blood Type Chips Row
                    Wrap(
                      spacing: 8,
                      children: bloodTypes.map((type) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: AppRadii.md,
                            border: Border.all(
                              color: const Color(0xFFE2E8F0),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Text(
                            type,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // Solid Primary Red CTA Button: "I Want To Donate" / "أريد التبرع"
                    LifeLinkButton(
                      label: _isDonated ? 'تم تسجيل رغبتك بالتبرع ✓' : 'أريد التبرع الآن',
                      icon: _isDonated ? Icons.check_circle_rounded : Icons.volunteer_activism_rounded,
                      backgroundColor: _isDonated ? AppColors.success : AppColors.primary,
                      onPressed: () {
                        setState(() {
                          _isDonated = !_isDonated;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              _isDonated
                                  ? 'شكراً لك! تم إرسال إشعار للمستشفى بقدومك.'
                                  : 'تم إلغاء الموعد.',
                            ),
                            backgroundColor: _isDonated ? AppColors.success : AppColors.navy,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
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

class _MapControlButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _MapControlButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: AppRadii.md,
      elevation: 3,
      shadowColor: Colors.black26,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.md,
        child: Container(
          width: 42,
          height: 42,
          alignment: Alignment.center,
          child: Icon(icon, color: AppColors.navy, size: 22),
        ),
      ),
    );
  }
}

/// CustomPainter that draws a beautiful stylized urban map grid
/// matching the Apple Maps / Google Maps aesthetic in the reference images.
class _StylizedMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // 1. Background (Light land tone)
    final bgPaint = Paint()..color = const Color(0xFFF3F5F8);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // 2. City Blocks
    final blockPaint = Paint()..color = const Color(0xFFE9ECF1);
    final parkPaint = Paint()..color = const Color(0xFFE2F0D9);

    final blocks = [
      // Top blocks
      Rect.fromLTWH(20, 40, size.width * 0.4, 70),
      Rect.fromLTWH(size.width * 0.48, 30, size.width * 0.45, 80),

      // Middle blocks
      Rect.fromLTWH(15, 140, size.width * 0.38, 110),
      Rect.fromLTWH(size.width * 0.46, 130, size.width * 0.48, 120),

      // Lower blocks
      Rect.fromLTWH(25, 275, size.width * 0.42, 100),
      Rect.fromLTWH(size.width * 0.52, 270, size.width * 0.42, 110),
    ];

    for (final r in blocks) {
      canvas.drawRRect(RRect.fromRectAndRadius(r, const Radius.circular(8)), blockPaint);
    }

    // Small park block
    final park = Rect.fromLTWH(size.width * 0.55, 145, 80, 50);
    canvas.drawRRect(RRect.fromRectAndRadius(park, const Radius.circular(6)), parkPaint);

    // 3. Roads & Avenues (White with subtle border)
    final roadBorderPaint = Paint()
      ..color = const Color(0xFFD6DBE1)
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    final roadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 12
      ..style = PaintingStyle.stroke;

    final smallRoadBorder = Paint()
      ..color = const Color(0xFFD6DBE1)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke;

    final smallRoadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke;

    // Major Vertical Avenues
    final vRoad1 = Path()
      ..moveTo(size.width * 0.44, 0)
      ..lineTo(size.width * 0.44, size.height);
    canvas.drawPath(vRoad1, roadBorderPaint);
    canvas.drawPath(vRoad1, roadPaint);

    // Major Horizontal Streets
    final hRoad1 = Path()
      ..moveTo(0, 120)
      ..lineTo(size.width, 120);
    canvas.drawPath(hRoad1, roadBorderPaint);
    canvas.drawPath(hRoad1, roadPaint);

    final hRoad2 = Path()
      ..moveTo(0, 260)
      ..lineTo(size.width, 260);
    canvas.drawPath(hRoad2, roadBorderPaint);
    canvas.drawPath(hRoad2, roadPaint);

    // Diagonal connector road
    final diagRoad = Path()
      ..moveTo(0, 340)
      ..lineTo(size.width, 380);
    canvas.drawPath(diagRoad, smallRoadBorder);
    canvas.drawPath(diagRoad, smallRoadPaint);

    // 4. Street Name Labels (Matching Reference: "3rd Ave", "7th St", "ASHOK NAGAR")
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    void drawLabel(String text, Offset offset, {double fontSize = 9, Color color = const Color(0xFF94A3B8)}) {
      textPainter.text = TextSpan(
        text: text,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: color,
          fontFamily: 'Cairo',
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, offset);
    }

    drawLabel('3rd Ave', const Offset(40, 124));
    drawLabel('7th St', Offset(size.width * 0.46, 170));
    drawLabel('13th St', Offset(size.width * 0.52, 90));
    drawLabel('ASHOK NAGAR', Offset(size.width * 0.35, 235), fontSize: 11, color: const Color(0xFF64748B));
    drawLabel('20th Ave', const Offset(50, 264));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
