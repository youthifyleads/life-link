import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class DonorCampaignsScreen extends StatefulWidget {
  const DonorCampaignsScreen({super.key});

  @override
  State<DonorCampaignsScreen> createState() => _DonorCampaignsScreenState();
}

class _DonorCampaignsScreenState extends State<DonorCampaignsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, dynamic>> _campaigns = [
    {
      'title': 'مستشفى قصر العيني - الحملة الكبرى',
      'address': 'شارع قصر العيني، ميدان التحرير، القاهرة',
      'date': '15 يونيو',
      'distance': '2.5 كم',
      'targetUnits': 120,
      'collectedUnits': 85,
    },
    {
      'title': 'المركز الإقليمي لخدمات نقل الدم بالعباسية',
      'address': 'شارع صلاح سالم، بجوار المعرض، القاهرة',
      'date': '18 يونيو',
      'distance': '4.1 كم',
      'targetUnits': 200,
      'collectedUnits': 140,
    },
    {
      'title': 'حملة جامعة القاهرة للتبرع بالدم',
      'address': 'الحرم الجامعي، الجيزة',
      'date': '20 يونيو',
      'distance': '5.3 كم',
      'targetUnits': 150,
      'collectedUnits': 95,
    },
    {
      'title': 'مستشفى الشيخ زايد التخصصي',
      'address': 'المحور المركزي، مدينة الشيخ زايد',
      'date': '24 يونيو',
      'distance': '18.0 كم',
      'targetUnits': 80,
      'collectedUnits': 30,
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _campaigns.where((c) {
      final title = (c['title'] as String).toLowerCase();
      final address = (c['address'] as String).toLowerCase();
      return title.contains(_searchQuery.toLowerCase()) ||
          address.contains(_searchQuery.toLowerCase());
    }).toList();

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
          'حملات التبرع',
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
      body: Column(
        children: [
          // Modern Search Bar (Matching Reference)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: AppRadii.full,
                border: Border.all(color: AppColors.border),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: InputDecoration(
                  hintText: 'بحث في الحملات أو المستشفيات...',
                  hintStyle: const TextStyle(
                    color: AppColors.textHint,
                    fontSize: 13,
                    fontFamily: 'Cairo',
                  ),
                  prefixIcon: const Icon(
                    Icons.search_rounded,
                    color: AppColors.textSecondary,
                    size: 20,
                  ),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                ),
              ),
            ),
          ),

          // Campaigns List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final item = filtered[index];
                return LifeLinkCard(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['title'] as String,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item['address'] as String,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text(
                                'المسافة',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textHint,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                              Text(
                                item['distance'] as String,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.navy,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      const Divider(height: 1),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.calendar_today_rounded,
                                size: 14,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                item['date'] as String,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                            ],
                          ),
                          InkWell(
                            onTap: () {
                              context.push('/donor/location', extra: item);
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              child: Text(
                                'عرض الموقع',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: LifeLinkBottomNav(
        currentIndex: 2,
        onTap: (index) {
          if (index == 0) context.go('/donor/home');
          if (index == 1) context.go('/donor/feed');
          if (index == 3) context.push('/profile');
        },
      ),
    );
  }
}
