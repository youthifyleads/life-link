import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/localization_extension.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_button.dart';
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
  late Future<List<Map<String, dynamic>>> _bloodBanksFuture;

  @override
  void initState() {
    super.initState();
    _loadBloodBanks();
  }

  void _loadBloodBanks() {
    _bloodBanksFuture = _fetchBloodBanks();
  }

  Future<List<Map<String, dynamic>>> _fetchBloodBanks() async {
    try {
      final dio = getIt<Dio>();
      final response = await dio.get(ApiEndpoints.bloodBanks);
      final list = (response.data as List).cast<Map<String, dynamic>>();
      return list;
    } catch (_) {
      return [];
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _loadBloodBanks();
    });
    await _bloodBanksFuture;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
          isAr ? 'مراكز وبنوك الدم' : 'Blood Banks & Centers',
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
      body: Column(
        children: [
          // Modern Search Bar
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
                  hintText: isAr ? 'بحث في بنوك الدم المعتمدة...' : 'Search certified blood banks...',
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

          // Live Blood Banks List
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _bloodBanksFuture,
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
                            isAr ? 'تعذر جلب البيانات من الخادم' : 'Unable to load blood banks',
                            style: const TextStyle(
                              fontFamily: 'Cairo',
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 16),
                          LifeLinkButton(
                            label: isAr ? 'إعادة المحاولة' : 'Try Again',
                            icon: Icons.refresh_rounded,
                            onPressed: _refresh,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final rawBanks = snapshot.data ?? [];
                final filtered = rawBanks.where((b) {
                  final name = (b['name'] as String? ?? '').toLowerCase();
                  final address = (b['address'] as String? ?? '').toLowerCase();
                  final gov = (b['governorate'] as String? ?? '').toLowerCase();
                  final q = _searchQuery.toLowerCase();
                  return name.contains(q) || address.contains(q) || gov.contains(q);
                }).toList();

                if (filtered.isEmpty) {
                  return RefreshIndicator(
                    onRefresh: _refresh,
                    color: AppColors.primary,
                    child: ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: 60),
                      children: [
                        Center(
                          child: Column(
                            children: [
                              Container(
                                width: 72,
                                height: 72,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF1F5F9),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.local_hospital_outlined,
                                  color: AppColors.textSecondary,
                                  size: 36,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                isAr ? 'لا توجد بنوك دم مطابقة للبحث' : 'No blood banks found',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                isAr
                                    ? 'تأكد من كتابة الاسم أو المحافظة بشكل صحيح'
                                    : 'Please check your search terms or filters',
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
                  );
                }

                return RefreshIndicator(
                  onRefresh: _refresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      final name = item['name'] as String? ?? (isAr ? 'بنك دم معتمد' : 'Certified Blood Bank');
                      final address = item['address'] as String? ?? item['governorate'] as String? ?? (isAr ? 'القاهرة' : 'Cairo');
                      final gov = item['governorate'] as String? ?? (isAr ? 'مصر' : 'Egypt');
                      final phoneList = (item['phones'] as List?)?.cast<String>() ?? [];
                      final phoneText = phoneList.isNotEmpty ? phoneList.first : null;

                      return LifeLinkCard(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFFFECEE),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.local_hospital_rounded,
                                    color: AppColors.primary,
                                    size: 22,
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                          fontFamily: 'Cairo',
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        address,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                          fontFamily: 'Cairo',
                                        ),
                                      ),
                                      if (phoneText != null) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          '${isAr ? "الهاتف" : "Tel"}: $phoneText',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.teal,
                                            fontFamily: 'Cairo',
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFE8F5E9),
                                    borderRadius: AppRadii.full,
                                  ),
                                  child: Text(
                                    gov,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF2E7D32),
                                      fontFamily: 'Cairo',
                                    ),
                                  ),
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
                                      Icons.check_circle_outline_rounded,
                                      size: 14,
                                      color: Color(0xFF2E7D32),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      isAr ? 'مركز استقبال معتمد' : 'Official Certified Center',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF2E7D32),
                                        fontFamily: 'Cairo',
                                      ),
                                    ),
                                  ],
                                ),
                                InkWell(
                                  onTap: () {
                                    context.push('/donor/location', extra: {
                                      'title': name,
                                      'hospital': name,
                                      'address': address,
                                      'governorate': gov,
                                    });
                                  },
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          isAr ? 'عرض الموقع' : 'View Location',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.primary,
                                            fontFamily: 'Cairo',
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(
                                          Icons.arrow_forward_ios_rounded,
                                          size: 11,
                                          color: AppColors.primary,
                                        ),
                                      ],
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
