import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/localization/localization_extension.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/notification_badge_button.dart';
import '../../data/donor_remote_datasource.dart';

class DonorUrgentAlertsScreen extends StatefulWidget {
  const DonorUrgentAlertsScreen({super.key});

  @override
  State<DonorUrgentAlertsScreen> createState() => _DonorUrgentAlertsScreenState();
}

class _DonorUrgentAlertsScreenState extends State<DonorUrgentAlertsScreen> {
  late Future<List<NearbyBloodRequest>> _alertsFuture;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  void _loadAlerts() {
    _alertsFuture = getIt<DonorRemoteDataSource>().getNearbyRequests();
  }

  Future<void> _refresh() async {
    setState(() {
      _loadAlerts();
    });
    await _alertsFuture;
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/donor/home'),
        ),
        title: Text(
          isAr ? 'تنبيهات عاجلة' : 'Urgent Alerts',
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
      body: FutureBuilder<List<NearbyBloodRequest>>(
        future: _alertsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textHint),
                    const SizedBox(height: 12),
                    Text(
                      isAr
                          ? 'تعذر جلب الطلبات من الخادم'
                          : 'Unable to fetch requests from server',
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      snapshot.error.toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    LifeLinkButton(
                      label: isAr ? 'إعادة المحاولة' : 'Try Again',
                      icon: Icons.refresh_rounded,
                      onPressed: () {
                        setState(() {
                          _loadAlerts();
                        });
                      },
                    ),
                  ],
                ),
              ),
            );
          }

          final alerts = snapshot.data ?? [];

          if (alerts.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refresh,
              color: AppColors.primary,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: 60),
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE8F5E9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_circle_outline_rounded,
                            color: Color(0xFF2E7D32),
                            size: 44,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          isAr
                              ? 'لا توجد طلبات دم عاجلة حالياً'
                              : 'No Urgent Blood Requests',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            fontFamily: 'Cairo',
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isAr
                              ? 'جميع المستشفيات المجاورة في حالة اكتفاء حالياً لفصيلتك. شكراً لجاهزيتك لإنقاذ الأرواح!'
                              : 'All nearby hospitals currently have adequate stock for your blood group.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontFamily: 'Cairo',
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                        OutlinedButton.icon(
                          onPressed: _refresh,
                          icon: const Icon(Icons.refresh_rounded, size: 18),
                          label: Text(isAr ? 'تحديث القائمة' : 'Refresh'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                            shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            color: AppColors.primary,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.lg,
              ),
              itemCount: alerts.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final item = alerts[index];
                final distanceText = item.distanceKm != null
                    ? '${item.distanceKm!.toStringAsFixed(1)} ${isAr ? 'كم' : 'km'}'
                    : (isAr ? 'قريب' : 'Nearby');
                final cityText = item.governorate ?? (isAr ? 'القاهرة' : 'Cairo');

                return LifeLinkCard(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  onTap: () {
                    context.push(
                      '/donor/request-details',
                      extra: {
                        'requestId': item.requestId,
                        'hospital': item.hospitalName,
                        'bloodType': item.bloodType,
                        'component': item.component,
                        'distance': distanceText,
                        'city': cityText,
                        'address': cityText,
                        'notes': item.notes,
                        'isUrgent': item.urgency,
                        'quantity': item.quantityUnits,
                      },
                    );
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Blood drop icon indicator
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.water_drop_rounded,
                          color: AppColors.primary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),

                      // Hospital Info & Blood types
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.hospitalName,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                fontFamily: 'Cairo',
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  isAr ? 'الفصيلة: ' : 'Type: ',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                Text(
                                  item.bloodType,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                if (item.quantityUnits > 0) ...[
                                  const SizedBox(width: 8),
                                  Text(
                                    '(${item.quantityUnits} ${isAr ? 'أكياس' : 'units'})',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textHint,
                                      fontFamily: 'Cairo',
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$cityText • $distanceText',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textHint,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: AppSpacing.sm),

                      // Urgent Badge Pill
                      if (item.urgency)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: AppRadii.full,
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Text(
                            isAr ? 'عاجل' : 'Urgent',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
      bottomNavigationBar: LifeLinkBottomNav(
        currentIndex: 1,
        onTap: (index) {
          if (index == 0) context.go('/donor/home');
          if (index == 2) context.go('/donor/campaigns');
          if (index == 3) context.push('/profile');
        },
      ),
    );
  }
}
