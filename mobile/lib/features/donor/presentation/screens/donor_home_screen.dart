import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_bottom_nav.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/lifelink_animations.dart';
import '../../../../core/localization/localization_extension.dart';
import '../bloc/donor_bloc.dart';
import '../utils/donor_hero_slogan_session.dart';
import '../../domain/models/donor_profile_model.dart';

class DonorHomeScreen extends StatefulWidget {
  const DonorHomeScreen({super.key});

  @override
  State<DonorHomeScreen> createState() => _DonorHomeScreenState();
}

class _DonorHomeScreenState extends State<DonorHomeScreen> {
  bool _isNextDonationConfirmed = false;

  String _getTimeBasedGreeting(bool isAr) {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return isAr ? 'صباح الخير' : 'Good Morning';
    } else if (hour < 17) {
      return isAr ? 'مساء الخير' : 'Good Afternoon';
    } else {
      return isAr ? 'مساء النور' : 'Good Evening';
    }
  }

  Widget _getTimeBasedGreetingIcon() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return const Icon(
        Icons.wb_sunny_rounded,
        size: 15,
        color: Color(0xFFF59E0B),
      );
    } else if (hour < 17) {
      return const Icon(
        Icons.wb_twilight_rounded,
        size: 15,
        color: Color(0xFFEA580C),
      );
    } else {
      return const Icon(
        Icons.nightlight_round,
        size: 14,
        color: Color(0xFF6366F1),
      );
    }
  }

  Future<void> _openNextDonationDetails(
    BuildContext context, {
    required bool isAr,
    required String bloodType,
  }) async {
    final res = await context.push<bool>(
      '/donor/request-details',
      extra: {
        'hospital': isAr
            ? 'مركز صحة المجتمع وبنك الدم'
            : 'Community Health & Blood Center',
        'bloodType': bloodType,
        'doctor': isAr ? 'د. أحمد فؤاد' : 'Dr. Ahmed Fouad',
        'date': isAr ? '15 يونيو 2024' : 'June 15, 2024',
        'time': isAr ? '11:30 ص إلى 02:00 م' : '11:30 AM to 02:00 PM',
        'address': isAr ? 'شارع قصر العيني، القاهرة' : 'Kasr Al-Ainy St, Cairo',
        'isConfirmed': _isNextDonationConfirmed,
      },
    );
    if (res != null && mounted) {
      setState(() {
        _isNextDonationConfirmed = res;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return BlocProvider(
      create: (_) => getIt<DonorBloc>()..add(LoadDonorProfileEvent()),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: BlocBuilder<DonorBloc, DonorState>(
            builder: (context, state) {
              DonorProfileModel? profile;
              if (state is DonorLoaded) {
                profile = state.profile;
              }

              final greeting = _getTimeBasedGreeting(isAr);
              final userName = profile?.fullName.isNotEmpty == true && profile?.fullName != '—'
                  ? profile!.fullName
                  : (isAr ? 'متبرع LifeLink' : 'LifeLink Donor');
              final bloodType = profile?.bloodType.isNotEmpty == true && profile?.bloodType != '—'
                  ? profile!.bloodType
                  : 'B+';

              return Column(
                children: [
                  // 1. Top Bar / Header (Avatar + Greeting + Notification Bell)
                  LifeLinkHomeHeader(
                    greeting: greeting,
                    greetingIcon: _getTimeBasedGreetingIcon(),
                    userName: userName,
                    onAvatarTap: () => context.push('/profile'),
                    onNotificationTap: () => context.push('/notifications'),
                  ),

                  // 2. Scrollable Body
                  Expanded(
                    child: RefreshIndicator(
                      color: AppColors.primary,
                      onRefresh: () async {
                        context.read<DonorBloc>().add(LoadDonorProfileEvent());
                      },
                      child: ListView(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.xs,
                        ),
                        children: [
                          // Mode Switcher (Donor vs Caregiver)
                          LifeLinkFadeSlide(
                            delay: const Duration(milliseconds: 0),
                            child: _ModernRoleToggle(
                              isDonor: true,
                              onToggleCaregiver: () => context.go('/caregiver/home'),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.md),

                          // Hero Carousel Banner: "SAVE A LIFE / GIVE BLOOD"
                          LifeLinkFadeSlide(
                            delay: const Duration(milliseconds: 25),
                            child: _HeroDonationBanner(
                              onTap: () => context.push('/donor/eligibility'),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.lg),

                          // 4 Quick Action / Category Pills (Urgent, Upcoming, Campaigns, History)
                          LifeLinkFadeSlide(
                            delay: const Duration(milliseconds: 50),
                            child: _CategoryTilesRow(
                              onUrgentTap: () => context.push('/donor/feed'),
                              onUpcomingTap: () => context.push('/donor/eligibility'),
                              onCampaignsTap: () => context.push('/donor/campaigns'),
                              onHistoryTap: () => context.push('/donor/vouchers'),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xl),

                          // Section 1: "تبرعك القادم" / "Your next donations"
                          LifeLinkFadeSlide(
                            delay: const Duration(milliseconds: 100),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _SectionHeader(
                                  title: isAr ? 'تبرعك القادم' : 'Your Next Donation',
                                  actionTitle: isAr ? 'عرض الكل' : 'See All',
                                  onActionTap: () => _openNextDonationDetails(
                                    context,
                                    isAr: isAr,
                                    bloodType: bloodType,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                _NextDonationCard(
                                  bloodType: bloodType,
                                  hospitalName: isAr
                                      ? 'مركز صحة المجتمع وبنك الدم'
                                      : 'Community Health & Blood Center',
                                  dateTime: profile?.daysUntilEligible != null && profile!.daysUntilEligible > 0
                                      ? (isAr
                                          ? 'متاح بعد ${profile.daysUntilEligible} يوم'
                                          : 'Available in ${profile.daysUntilEligible} days')
                                      : (isAr ? '15 يونيو • 11:30 ص' : 'June 15 • 11:30 AM'),
                                  isConfirmed: _isNextDonationConfirmed,
                                  onCardTap: () => _openNextDonationDetails(
                                    context,
                                    isAr: isAr,
                                    bloodType: bloodType,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xl),

                          // Section 2: "الطلبات العاجلة" / "Requests"
                          LifeLinkFadeSlide(
                            delay: const Duration(milliseconds: 125),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _SectionHeader(
                                  title: isAr ? 'الطلبات العاجلة' : 'Urgent Requests',
                                  actionTitle: isAr ? 'عرض الكل' : 'See All',
                                  onActionTap: () => context.push('/donor/feed'),
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                _UrgentRequestsList(
                                  onItemTap: (hospital) {
                                    context.push(
                                      '/donor/request-details',
                                      extra: {
                                        'hospital': hospital,
                                        'bloodType': 'O-  A+  AB+',
                                        'doctor': isAr ? 'د. محمود صبري' : 'Dr. Mahmoud Sabry',
                                        'date': isAr ? 'اليوم • طوارئ' : 'Today • Emergency',
                                        'time': isAr ? 'متاح على مدار 24 ساعة' : 'Available 24 Hours',
                                        'address': isAr ? 'ميدان التحرير، القاهرة' : 'Tahrir Square, Cairo',
                                      },
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: AppSpacing.xxl),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
        bottomNavigationBar: LifeLinkBottomNav(
          currentIndex: 0,
          onTap: (index) {
            if (index == 1) context.push('/donor/feed');
            if (index == 2) context.push('/donor/campaigns');
            if (index == 3) context.push('/profile');
          },
        ),
      ),
    );
  }
}

// ── 1. Modern Role Toggle ──────────────────────────────────────
class _ModernRoleToggle extends StatelessWidget {
  final bool isDonor;
  final VoidCallback onToggleCaregiver;

  const _ModernRoleToggle({
    required this.isDonor,
    required this.onToggleCaregiver,
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
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isDonor ? Colors.white : Colors.transparent,
                borderRadius: AppRadii.full,
                boxShadow: isDonor ? AppShadows.soft : null,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.water_drop_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isAr ? 'أنا متبرع بالدم' : 'I am a Donor',
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
          Expanded(
            child: InkWell(
              onTap: onToggleCaregiver,
              borderRadius: AppRadii.full,
              child: Container(
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.favorite_outline_rounded,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isAr ? 'أنا مرافق مريض' : 'I am a Caregiver',
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
        ],
      ),
    );
  }
}

// ── 2. Hero Carousel Banner ───────────────────────────────────
class _SloganItem {
  final String titleAr;
  final String titleEn;
  final String subtitleAr;
  final String subtitleEn;

  const _SloganItem({
    required this.titleAr,
    required this.titleEn,
    required this.subtitleAr,
    required this.subtitleEn,
  });
}

const List<_SloganItem> _heroSlogans = [
  _SloganItem(
    titleAr: 'أنت الأمل في اللحظة الحرجة',
    titleEn: 'Hope in Critical Moments',
    subtitleAr: 'دقائق من وقتك قد تعيد أباً، أماً أو طفلاً إلى عائلته.',
    subtitleEn: 'A few minutes of your time can bring a loved one home.',
  ),
  _SloganItem(
    titleAr: 'نبضك حياة لغيرك',
    titleEn: 'Your Pulse, Their Life',
    subtitleAr: 'عطاءٌ بسيط منك، يمنح مريضاً فرصة ثانية للحياة.',
    subtitleEn: 'A simple gift from you grants someone a second chance.',
  ),
  _SloganItem(
    titleAr: 'كن شريان النجاة',
    titleEn: 'Be Their Lifeline',
    subtitleAr: 'في غرف الطوارئ، خطوتك اليوم تصنع الفارق بين الخطر والشفاء.',
    subtitleEn: 'In emergency rooms, your action is the difference between danger and recovery.',
  ),
];

class _HeroDonationBanner extends StatefulWidget {
  final VoidCallback onTap;

  const _HeroDonationBanner({required this.onTap});

  @override
  State<_HeroDonationBanner> createState() => _HeroDonationBannerState();
}

class _HeroDonationBannerState extends State<_HeroDonationBanner> {
  int _currentIndex = 0;
  Timer? _autoCycleTimer;

  @override
  void initState() {
    super.initState();
    _currentIndex = DonorHeroSloganSession.currentIndex;
    _rotateSloganOnSession();

    // Subtle auto-advance every 6.5 seconds
    _autoCycleTimer = Timer.periodic(const Duration(milliseconds: 6500), (_) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % _heroSlogans.length;
          DonorHeroSloganSession.currentIndex = _currentIndex;
        });
      }
    });
  }

  Future<void> _rotateSloganOnSession() async {
    try {
      final storage = getIt<FlutterSecureStorage>();
      final val = await storage.read(key: 'donor_hero_slogan_index');
      final currentStored = int.tryParse(val ?? '0') ?? 0;

      if (!DonorHeroSloganSession.hasPickedForCurrentSession) {
        DonorHeroSloganSession.hasPickedForCurrentSession = true;
        final nextIdx = (currentStored + 1) % _heroSlogans.length;
        await storage.write(key: 'donor_hero_slogan_index', value: nextIdx.toString());
        DonorHeroSloganSession.currentIndex = nextIdx;
      }

      if (mounted) {
        setState(() {
          _currentIndex = DonorHeroSloganSession.currentIndex;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _currentIndex = DonorHeroSloganSession.currentIndex;
        });
      }
    }
  }

  @override
  void dispose() {
    _autoCycleTimer?.cancel();
    super.dispose();
  }

  void _selectIndex(int index) {
    setState(() {
      _currentIndex = index;
      DonorHeroSloganSession.currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;
    final slogan = _heroSlogans[_currentIndex];

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      onTap: widget.onTap,
      child: Column(
        children: [
          Row(
            children: [
              // Brand Logo (clean and static)
              Image.asset(
                'assets/images/logo.webp',
                width: 72,
                height: 72,
                fit: BoxFit.contain,
              ),
              const SizedBox(width: AppSpacing.md),

              // Slogan & Call to action
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isAr ? 'لايـــف ليـــنــك • LIFELINK' : 'LIFELINK • CONNECTING HEARTS',
                      style: const TextStyle(
                        fontSize: 11.5,
                        letterSpacing: 1.1,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: 2),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 350),
                      transitionBuilder: (child, animation) => FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.0, 0.12),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      ),
                      child: Column(
                        key: ValueKey<int>(_currentIndex),
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: isAr ? Alignment.centerRight : Alignment.centerLeft,
                            child: Text(
                              isAr ? slogan.titleAr : slogan.titleEn,
                              style: const TextStyle(
                                fontSize: 21,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                                fontFamily: 'Cairo',
                                height: 1.2,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isAr ? slogan.subtitleAr : slogan.subtitleEn,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Interactive Animated Carousel dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_heroSlogans.length, (index) {
              final isActive = index == _currentIndex;
              return GestureDetector(
                onTap: () => _selectIndex(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 2.5),
                  width: isActive ? 18 : 6,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : AppColors.border,
                    borderRadius: AppRadii.full,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

// ── 3. Category Tiles Row (4 Colorful Pills from Reference) ───
class _CategoryTilesRow extends StatelessWidget {
  final VoidCallback onUrgentTap;
  final VoidCallback onUpcomingTap;
  final VoidCallback onCampaignsTap;
  final VoidCallback onHistoryTap;

  const _CategoryTilesRow({
    required this.onUrgentTap,
    required this.onUpcomingTap,
    required this.onCampaignsTap,
    required this.onHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Row(
      children: [
        // 1. Urgent (Light Coral / Red)
        Expanded(
          child: _CategoryPill(
            backgroundColor: const Color(0xFFFFECEE),
            iconColor: AppColors.primary,
            icon: Icons.emergency_rounded,
            label: isAr ? 'حالات عاجلة' : 'Urgent',
            onTap: onUrgentTap,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // 2. Upcoming (Light Sky Blue)
        Expanded(
          child: _CategoryPill(
            backgroundColor: const Color(0xFFE8F3FF),
            iconColor: AppColors.secondaryBlue,
            icon: Icons.calendar_month_rounded,
            label: isAr ? 'مواعيد قادمة' : 'Upcoming',
            onTap: onUpcomingTap,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // 3. Campaigns (Light Mint Green)
        Expanded(
          child: _CategoryPill(
            backgroundColor: const Color(0xFFEAF7EE),
            iconColor: AppColors.teal,
            icon: Icons.campaign_rounded,
            label: isAr ? 'حملات التبرع' : 'Campaigns',
            onTap: onCampaignsTap,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // 4. History / Rewards (Light Lavender)
        Expanded(
          child: _CategoryPill(
            backgroundColor: const Color(0xFFF3E8FF),
            iconColor: AppColors.purple,
            icon: Icons.card_giftcard_rounded,
            label: isAr ? 'الجوائز' : 'Rewards',
            onTap: onHistoryTap,
          ),
        ),
      ],
    );
  }
}

class _CategoryPill extends StatefulWidget {
  final Color backgroundColor;
  final Color iconColor;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _CategoryPill({
    required this.backgroundColor,
    required this.iconColor,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  State<_CategoryPill> createState() => _CategoryPillState();
}

class _CategoryPillState extends State<_CategoryPill> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final pressedBg = Color.lerp(widget.backgroundColor, widget.iconColor, 0.18)!;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOutCubic,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: _isPressed ? pressedBg : widget.backgroundColor,
            borderRadius: AppRadii.md,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, color: widget.iconColor, size: 24),
              const SizedBox(height: 6),
              Text(
                widget.label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}


// ── 5. Section Header with "see all" ──────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  final String actionTitle;
  final VoidCallback onActionTap;

  const _SectionHeader({
    required this.title,
    required this.actionTitle,
    required this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        InkWell(
          onTap: onActionTap,
          borderRadius: AppRadii.sm,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            child: Text(
              actionTitle,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── 6. "Your next donations" Card (Matching Reference) ────────
class _NextDonationCard extends StatelessWidget {
  final String bloodType;
  final String hospitalName;
  final String dateTime;
  final bool isConfirmed;
  final VoidCallback onCardTap;

  const _NextDonationCard({
    required this.bloodType,
    required this.hospitalName,
    required this.dateTime,
    required this.isConfirmed,
    required this.onCardTap,
  });

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      onTap: onCardTap,
      child: Column(
        children: [
          Row(
            children: [
              // Circular Bold Blood Group Badge (Red Circle with White Text)
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  bloodType,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),

              // Hospital & Time Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hospitalName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        fontFamily: 'Cairo',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateTime,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
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
          const SizedBox(height: AppSpacing.md),

          // Action Button: Tapping navigates to donation request screen to confirm there
          AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            child: LifeLinkButton(
              label: isConfirmed
                  ? (isAr ? 'تم تأكيد الموعد ✓' : 'Appointment Confirmed ✓')
                  : (isAr ? 'تأكيد الموعد' : 'Confirm Appointment'),
              icon: isConfirmed ? Icons.check_circle_rounded : Icons.arrow_forward_rounded,
              backgroundColor: isConfirmed ? const Color(0xFF2E7D32) : AppColors.primary,
              height: 46,
              onPressed: onCardTap,
            ),
          ),
        ],
      ),
    );
  }
}

// ── 7. "Requests" List (Matching Reference) ───────────────────
class _UrgentRequestsList extends StatelessWidget {
  final ValueChanged<String> onItemTap;

  const _UrgentRequestsList({required this.onItemTap});

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    final requests = [
      {
        'hospital': isAr ? 'مستشفى قصر العيني - طوارئ' : 'Kasr Al-Ainy Hospital - Emergency',
        'bloodTypes': 'O-  A+  AB+',
      },
      {
        'hospital': isAr ? 'مستشفى الدمرداش الجامعي' : 'Demerdash University Hospital',
        'bloodTypes': 'O+  AB+',
      },
    ];

    return Column(
      children: requests.map((req) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: LifeLinkCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            onTap: () => onItemTap(req['hospital']!),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        req['hospital']!,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            isAr ? 'الفصائل المطلوبة: ' : 'Required: ',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          Text(
                            req['bloodTypes']!,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Urgent Pill Tag (Static, dignified and clear)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFFECEE),
                    borderRadius: AppRadii.full,
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
          ),
        );
      }).toList(),
    );
  }
}

