import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/notification_badge_button.dart';
import '../bloc/donor_bloc.dart';

class DonorHomeScreen extends StatelessWidget {
  const DonorHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<DonorBloc>()..add(LoadDonorProfileEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('LifeLink'),
          actions: [
            const NotificationBadgeButton(),
            IconButton(
              tooltip: 'Profile and settings',
              icon: const Icon(Icons.account_circle_outlined),
              onPressed: () => context.push('/profile'),
            ),
          ],
        ),
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            context.read<DonorBloc>().add(LoadDonorProfileEvent());
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            children: [
              // Mode Switcher (Donor vs Caregiver)
              _ModeSwitcher(
                isDonorSelected: true,
                onSelectDonor: () {},
                onSelectCaregiver: () => context.go('/caregiver/home'),
              ),
              const SizedBox(height: AppSpacing.lg),

              const _DonorHero(),
              const SizedBox(height: AppSpacing.lg),
              const _ReadinessPanel(),
              const SizedBox(height: AppSpacing.lg),
              Text('الطلبات والتنبيهات العاجلة',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppSpacing.md),
              const _ActionGrid(),
              const SizedBox(height: AppSpacing.xl),
              Text('رحلة عطائك بالدم',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: AppSpacing.md),
              _JourneyRow(
                icon: Icons.card_giftcard_rounded,
                title: 'كوبونات ومكافآت التبرع',
                subtitle: 'استعراض كوبونات الخصم المكتسبة من تبرعاتك.',
                onTap: () => context.push('/donor/vouchers'),
              ),
              _JourneyRow(
                icon: Icons.volunteer_activism_outlined,
                title: 'البحث عن طلبات دم محتاجة',
                subtitle: 'استعراض طلبات الاستغاثة القريبة المتوافقة معك.',
                onTap: () => context.push('/donor/feed'),
              ),
              _JourneyRow(
                icon: Icons.history_rounded,
                title: 'سجل تبرعاتك السابقة',
                subtitle: 'متابعة سجل التبرعات السابقة وشهادات التقدير.',
                onTap: () => context.push('/donor/eligibility'),
              ),
              _JourneyRow(
                icon: Icons.reply_outlined,
                title: 'سجل استجاباتك للنداءات',
                subtitle: 'مراجعة استجاباتك وتأكيداتك لطلبات التبرع.',
                onTap: () => context.push('/donor/responses'),
              ),
              _JourneyRow(
                icon: Icons.verified_user_outlined,
                title: 'الموافقات الطبية والشروط',
                subtitle: 'مراجعة وتحديث اختيارات الموافقة السريرية.',
                onTap: () => context.push('/donor/consents'),
              ),
              _JourneyRow(
                icon: Icons.menu_book_outlined,
                title: 'كيف يعمل LifeLink؟',
                subtitle: 'فهم شروط الأهلية والتعافي وتوافق الفصائل.',
                onTap: () => context.push('/help/donor'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ModeSwitcher extends StatelessWidget {
  final bool isDonorSelected;
  final VoidCallback onSelectDonor;
  final VoidCallback onSelectCaregiver;

  const _ModeSwitcher({
    required this.isDonorSelected,
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
              onTap: !isDonorSelected ? onSelectDonor : null,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isDonorSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isDonorSelected
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
                      color: isDonorSelected ? Colors.white : Colors.grey[700],
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'أنا متبرع بالدم',
                      style: TextStyle(
                        color: isDonorSelected ? Colors.white : Colors.grey[800],
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: InkWell(
              onTap: isDonorSelected ? onSelectCaregiver : null,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: !isDonorSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: !isDonorSelected
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
                      color: !isDonorSelected ? Colors.white : Colors.grey[700],
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'أنا مرافق مريض',
                      style: TextStyle(
                        color: !isDonorSelected ? Colors.white : Colors.grey[800],
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

class _ReadinessPanel extends StatelessWidget {
  const _ReadinessPanel();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DonorBloc, DonorState>(
      builder: (context, state) {
        if (state is DonorLoading) {
          return const _PanelShell(
            child: SizedBox(
              height: 72,
              child: Center(child: CircularProgressIndicator()),
            ),
          );
        }
        if (state is DonorLoaded) {
          final profile = state.profile;
          final available = profile.availableToDonate;
          return _PanelShell(
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: available
                            ? AppColors.tealLight
                            : AppColors.primaryLight,
                        borderRadius: AppRadii.sm,
                      ),
                      child: Icon(
                        available
                            ? Icons.favorite_rounded
                            : Icons.pause_circle_outline,
                        color: available ? AppColors.teal : AppColors.primary,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            available
                                ? 'You are ready to help'
                                : 'Availability is off',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(color: Colors.white),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            profile.isEligible
                                ? 'Let LifeLink know when you can respond to a request.'
                                : 'Your eligibility will update when the required interval is complete.',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: available,
                      onChanged: profile.isEligible
                          ? (value) => context
                              .read<DonorBloc>()
                              .add(SetDonorAvailabilityEvent(value))
                          : null,
                      activeThumbColor: AppColors.teal,
                    ),
                  ],
                ),
                const Divider(height: AppSpacing.lg),
                Wrap(
                  spacing: AppSpacing.md,
                  runSpacing: AppSpacing.sm,
                  children: [
                    _ProfileFact(
                      label: 'Blood type',
                      value: profile.bloodType,
                      icon: Icons.bloodtype_outlined,
                    ),
                    _ProfileFact(
                      label: 'Donations',
                      value: '${profile.totalDonations}',
                      icon: Icons.volunteer_activism_outlined,
                    ),
                    _ProfileFact(
                      label: 'Last donation',
                      value: profile.lastDonationDate == null
                          ? 'Not recorded'
                          : DateFormat.yMMMd().format(
                              profile.lastDonationDate!.toLocal(),
                            ),
                      icon: Icons.history_rounded,
                    ),
                  ],
                ),
              ],
            ),
          );
        }
        return const _PanelShell(
          child: Text('We could not load your readiness. Pull to try again.'),
        );
      },
    );
  }
}

class _ProfileFact extends StatelessWidget {
  const _ProfileFact({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label: $value',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: Colors.white70),
          const SizedBox(width: 6),
          Text(
            '$label: $value',
            style: const TextStyle(color: Colors.white, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _DonorHero extends StatelessWidget {
  const _DonorHero();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.navy, AppColors.secondaryBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadii.lg,
        boxShadow: AppShadows.soft,
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: AppRadii.md,
            ),
            child: const Icon(
              Icons.volunteer_activism_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your impact starts here',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: AppSpacing.xs),
                const Text(
                  'Stay ready and respond when your blood type is needed.',
                  style: TextStyle(color: Color(0xFFDDEBF3), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionGrid extends StatelessWidget {
  const _ActionGrid();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final tileWidth = (constraints.maxWidth - AppSpacing.md) / 2;
        return Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.md,
          children: [
            SizedBox(
              width: tileWidth,
              child: _ActionTile(
                icon: Icons.volunteer_activism_outlined,
                label: 'Requests',
                color: AppColors.primary,
                onTap: () => context.push('/donor/feed'),
              ),
            ),
            SizedBox(
              width: tileWidth,
              child: _ActionTile(
                icon: Icons.verified_outlined,
                label: 'Eligibility',
                color: AppColors.secondaryBlue,
                onTap: () => context.push('/donor/eligibility'),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        borderRadius: AppRadii.md,
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadii.md,
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: AppSpacing.md),
              Text(label, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: AppSpacing.xs),
              const Icon(Icons.arrow_forward_rounded,
                  size: 18, color: AppColors.textHint),
            ],
          ),
        ),
      ),
    );
  }
}

class _JourneyRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _JourneyRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      leading: Container(
        width: 44,
        height: 44,
        decoration: const BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: AppRadii.sm,
        ),
        child: Icon(icon, color: AppColors.navy),
      ),
      title: Text(title, style: Theme.of(context).textTheme.titleMedium),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    );
  }
}

class _PanelShell extends StatelessWidget {
  final Widget child;

  const _PanelShell({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: const BoxDecoration(
        color: AppColors.navy,
        borderRadius: AppRadii.lg,
        boxShadow: AppShadows.soft,
      ),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.white),
        child: IconTheme(
          data: const IconThemeData(color: Colors.white),
          child: child,
        ),
      ),
    );
  }
}
