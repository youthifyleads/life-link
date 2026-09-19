import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class DonorUrgentAlertsScreen extends StatelessWidget {
  const DonorUrgentAlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Sample urgent requests matching the visual reference (Phone 2)
    final urgentAlerts = [
      {
        'hospital': 'مستشفى قصر العيني - طوارئ الجراحة',
        'bloodTypes': 'O-  A+  AB+',
        'distance': '1.8 كم',
        'city': 'القاهرة • المنيل',
        'isUrgent': true,
      },
      {
        'hospital': 'مستشفى الدمرداش الجامعي',
        'bloodTypes': 'O+  AB+  B+',
        'distance': '3.2 كم',
        'city': 'القاهرة • العباسية',
        'isUrgent': true,
      },
      {
        'hospital': 'معهد ناصر للأبحاث والعلاج',
        'bloodTypes': 'A-  O-  B-',
        'distance': '4.5 كم',
        'city': 'القاهرة • كورنيش شبرا',
        'isUrgent': true,
      },
      {
        'hospital': 'مستشفى عين شمس التخصصي',
        'bloodTypes': 'O+  A+  B+',
        'distance': '5.1 كم',
        'city': 'القاهرة • العباسية',
        'isUrgent': true,
      },
      {
        'hospital': 'مركز أورام السلام',
        'bloodTypes': 'AB-  O-  A+',
        'distance': '6.4 كم',
        'city': 'القاهرة • السلام',
        'isUrgent': true,
      },
    ];

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
        title: const Text(
          'تنبيهات عاجلة',
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
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.lg,
        ),
        itemCount: urgentAlerts.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (context, index) {
          final item = urgentAlerts[index];
          return LifeLinkCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            onTap: () {
              context.push('/donor/location', extra: item);
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
                        item['hospital'] as String,
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
                          const Text(
                            'الفصائل: ',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          Text(
                            item['bloodTypes'] as String,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${item['city']} • ${item['distance']}',
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

                // Urgent Badge Pill (Matching Reference)
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
                  child: const Text(
                    'Urgent',
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
