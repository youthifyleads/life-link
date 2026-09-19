import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../theme/app_colors.dart';
import '../theme/design_tokens.dart';
import '../localization/locale_cubit.dart';
import '../localization/app_strings.dart';

class LifeLinkBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const LifeLinkBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocaleCubit, Locale>(
      builder: (context, locale) {
        final lang = locale.languageCode;
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              top: BorderSide(color: Color(0xFFEDF2F7), width: 1.0),
            ),
            boxShadow: AppShadows.bottomNav,
          ),
          child: SafeArea(
            top: false,
            child: Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _NavItem(
                    icon: Icons.home_rounded,
                    activeIcon: Icons.home_rounded,
                    label: AppStrings.get('nav_home', locale: lang),
                    isSelected: currentIndex == 0,
                    onTap: () => onTap(0),
                  ),
                  _NavItem(
                    icon: Icons.water_drop_outlined,
                    activeIcon: Icons.water_drop_rounded,
                    label: AppStrings.get('nav_donate', locale: lang),
                    isSelected: currentIndex == 1,
                    onTap: () => onTap(1),
                  ),
                  _NavItem(
                    icon: Icons.campaign_outlined,
                    activeIcon: Icons.campaign_rounded,
                    label: AppStrings.get('nav_tracking', locale: lang),
                    isSelected: currentIndex == 2,
                    onTap: () => onTap(2),
                  ),
                  _NavItem(
                    icon: Icons.person_outline_rounded,
                    activeIcon: Icons.person_rounded,
                    label: AppStrings.get('nav_profile', locale: lang),
                    isSelected: currentIndex == 3,
                    onTap: () => onTap(3),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: AppRadii.full,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primaryLight
                    : Colors.transparent,
                borderRadius: AppRadii.full,
              ),
              child: AnimatedScale(
                scale: isSelected ? 1.04 : 1.0,
                duration: const Duration(milliseconds: 140),
                curve: Curves.easeOutCubic,
                child: Icon(
                  isSelected ? activeIcon : icon,
                  color: isSelected ? AppColors.primary : const Color(0xFF94A3B8),
                  size: 24,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : const Color(0xFF94A3B8),
                fontFamily: 'Cairo',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
