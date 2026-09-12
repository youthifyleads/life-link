import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/notification_badge_button.dart';
import '../../../../core/di/injection.dart';
import '../bloc/donor_bloc.dart';

class DonorHomeScreen extends StatelessWidget {
  const DonorHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LifeLink Home'),
        actions: [
          const NotificationBadgeButton(),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            tooltip: 'Profile and settings',
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: BlocProvider(
        create: (_) => getIt<DonorBloc>()..add(LoadDonorProfileEvent()),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Welcome, Donor',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            const Text(
              'Complete your profile, verify your blood type, and choose when you are available to help.',
            ),
            const SizedBox(height: 20),
            _DashboardCard(
              icon: Icons.volunteer_activism,
              title: 'Donation Feed',
              subtitle: 'See compatible requests and offer to donate',
              onTap: () => context.push('/donor/feed'),
            ),
            BlocBuilder<DonorBloc, DonorState>(
              builder: (context, state) {
                if (state is DonorLoading) {
                  return const Card(
                    child: ListTile(
                      leading: CircularProgressIndicator(),
                      title: Text('Loading eligibility and availability...'),
                    ),
                  );
                }
                if (state is DonorLoaded) {
                  return Card(
                    child: SwitchListTile(
                      title: const Text('I am available to donate'),
                      subtitle: Text(
                        state.profile.isEligible
                            ? 'Eligible donors can receive matching opportunities.'
                            : 'Availability is disabled until the six-month interval is complete.',
                      ),
                      value: state.profile.availableToDonate,
                      onChanged: state.profile.isEligible
                          ? (value) => context
                              .read<DonorBloc>()
                              .add(SetDonorAvailabilityEvent(value))
                          : null,
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            _DashboardCard(
              icon: Icons.verified_user_outlined,
              title: 'Eligibility and history',
              subtitle:
                  'Check the six-month eligibility rule and past donations',
              onTap: () => context.push('/donor/eligibility'),
            ),
            _DashboardCard(
              icon: Icons.help_outline,
              title: 'How LifeLink works',
              subtitle: 'Learn about matching, verification, and notifications',
              onTap: () => context.push('/help/donor'),
            ),
            _DashboardCard(
              icon: Icons.settings_outlined,
              title: 'Profile and settings',
              subtitle: 'Update your personal information and preferences',
              onTap: () => context.push('/profile'),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _DashboardCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primaryLight,
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
