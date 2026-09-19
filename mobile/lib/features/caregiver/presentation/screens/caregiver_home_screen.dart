import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class CaregiverHomeScreen extends StatelessWidget {
  const CaregiverHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('خدمات المرافق والمريض'),
        centerTitle: true,
        actions: [
          const NotificationBadgeButton(),
          IconButton(
            tooltip: 'الملف الشخصي والإعدادات',
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          AppSpacing.xxl,
        ),
        children: [
          // Mode Switcher (Donor vs Caregiver)
          _ModeSwitcher(
            isCaregiverSelected: true,
            onSelectDonor: () => context.go('/donor/home'),
            onSelectCaregiver: () {},
          ),
          const SizedBox(height: AppSpacing.lg),

          // Primary Action Card: Scan Hospital Request QR
          _ScanRequestHeroCard(onTap: () => context.push('/qr/scan')),
          const SizedBox(height: AppSpacing.xl),

          Text(
            'خدمات المتابعة والرعاية',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.navy,
                ),
          ),
          const SizedBox(height: AppSpacing.sm),

          _WorkspaceTile(
            icon: Icons.qr_code_scanner_rounded,
            title: 'مسح وتتبع إذن صرف الدم',
            subtitle: 'امسح QR المستشفى للاطلاع على الفاتورة وتتبع المندوب',
            accent: AppColors.primary,
            onTap: () => context.push('/qr/scan'),
          ),
          _WorkspaceTile(
            icon: Icons.people_alt_outlined,
            title: 'سجل المرضى',
            subtitle: 'إدارة ملفات المرضى التابعين لك وتحديث بياناتهم',
            accent: AppColors.teal,
            onTap: () => context.push('/caregiver/patients'),
          ),
          _WorkspaceTile(
            icon: Icons.payments_outlined,
            title: 'الفواتير والمدفوعات الإلكترونية',
            subtitle: 'استعراض إيصالات السداد وحالة الدفع عبر Paymob',
            accent: AppColors.warning,
            onTap: () => context.push('/caregiver/payment-history'),
          ),
          _WorkspaceTile(
            icon: Icons.assignment_outlined,
            title: 'سجل التعيينات والتسليم',
            subtitle: 'متابعة بيانات أكياس الدم المسندة وملاحظات المستشفى',
            accent: AppColors.navy,
            onTap: () => context.push('/caregiver/assignments'),
          ),
          _WorkspaceTile(
            icon: Icons.inventory_outlined,
            title: 'Allocations',
            subtitle: 'Review blood preparation allocations',
            accent: AppColors.navy,
            onTap: () => context.push('/caregiver/allocations'),
          ),
          _WorkspaceTile(
            icon: Icons.inventory_2_outlined,
            title: 'Blood bags',
            subtitle: 'Review bag status and movement history',
            accent: AppColors.teal,
            onTap: () => context.push('/caregiver/blood-bags'),
          ),
          _WorkspaceTile(
            icon: Icons.qr_code_scanner_rounded,
            title: 'Scan blood bag or request',
            subtitle: 'Scan a caregiver blood-bag or request QR',
            accent: AppColors.info,
            onTap: () => context.push('/caregiver/scan'),

          const SizedBox(height: AppSpacing.lg),

          // Clinical Responsibility Disclaimer Banner
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline_rounded, color: AppColors.secondaryBlue, size: 22),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'إرشاد طبي هام',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: AppColors.secondaryBlue,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'طلبات صرف الدم تصدر حصرياً ومباشرةً من طبيب المستشفى المعالج وفق المعايير الطبية المعتمدة. كل ما عليك كمرافق هو مسح كود الطلب لمتابعة حالة وصول الدم وسداد الرسوم.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          height: 1.4,
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
    );
  }
}

class _ModeSwitcher extends StatelessWidget {
  final bool isCaregiverSelected;
  final VoidCallback onSelectDonor;
  final VoidCallback onSelectCaregiver;

  const _ModeSwitcher({
    required this.isCaregiverSelected,
    required this.onSelectDonor,
    required this.onSelectCaregiver,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: isCaregiverSelected ? onSelectDonor : null,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: !isCaregiverSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: !isCaregiverSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.volunteer_activism_rounded,
                      color: !isCaregiverSelected ? Colors.white : Colors.grey[700],
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'أنا متبرع بالدم',
                      style: TextStyle(
                        color: !isCaregiverSelected ? Colors.white : Colors.grey[800],
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          _WorkspaceTile(
            icon: Icons.history_rounded,
            title: 'Caregiver history',
            subtitle: 'Review payment history returned by Azure',
            accent: AppColors.info,
            onTap: () => context.push('/caregiver/payment-history'),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('Need a walkthrough?',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          TextButton.icon(
            onPressed: () => context.push('/help/caregiver'),
            icon: const Icon(Icons.menu_book_outlined),
            label: const Text('How LifeLink works'),
            style: TextButton.styleFrom(alignment: Alignment.centerLeft),
          Expanded(
            child: InkWell(
              onTap: !isCaregiverSelected ? onSelectCaregiver : null,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isCaregiverSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isCaregiverSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.family_restroom_rounded,
                      color: isCaregiverSelected ? Colors.white : Colors.grey[700],
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'أنا مرافق مريض',
                      style: TextStyle(
                        color: isCaregiverSelected ? Colors.white : Colors.grey[800],
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
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

class _ScanRequestHeroCard extends StatelessWidget {
  final VoidCallback onTap;

  const _ScanRequestHeroCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.navy, Color(0xFF1E405E)],
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.navy.withValues(alpha: 0.25),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 36),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'مسح كود طلب المستشفى',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'امسح رمز QR الصادر من الطبيب لمتابعة الطلب والدفع',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt_outlined, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'فتح الكاميرا ومسح الكود الآن',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkspaceTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accent;
  final VoidCallback onTap;

  const _WorkspaceTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accent,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        minVerticalPadding: AppSpacing.sm,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: accent, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        trailing: const Icon(Icons.chevron_left_rounded, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }
}
