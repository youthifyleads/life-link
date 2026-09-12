import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/notification_badge_button.dart';

class CaregiverHomeScreen extends StatelessWidget {
  const CaregiverHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LifeLink Home'),
        actions: [
          const NotificationBadgeButton(),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Welcome, Caregiver',
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          const Text(
              'Manage your patient requests, matching results, tracking, and payments from one place.'),
          const SizedBox(height: 20),
          _CaregiverCard(
            icon: Icons.bloodtype_outlined,
            title: 'My blood requests',
            subtitle: 'Create and follow patient requests',
            onTap: () => context.push('/caregiver/requests'),
          ),
          _CaregiverCard(
            icon: Icons.people_alt_outlined,
            title: 'Patients',
            subtitle: 'Manage patient profiles and blood types',
            onTap: () => context.push('/caregiver/patients'),
          ),
          _CaregiverCard(
            icon: Icons.assignment_outlined,
            title: 'Assignments',
            subtitle: 'Review caregiver blood-bag assignments and notes',
            onTap: () => context.push('/caregiver/assignments'),
          ),
          _CaregiverCard(
            icon: Icons.qr_code_scanner,
            title: 'Blood-bag tracking',
            subtitle: 'Request-level tracking and QR scan status',
            onTap: () => context.push('/qr/scan'),
          ),
          _CaregiverCard(
            icon: Icons.payments_outlined,
            title: 'Payments',
            subtitle: 'Review request-specific payment history',
            onTap: () => context.push('/caregiver/payment-history'),
          ),
          _CaregiverCard(
            icon: Icons.help_outline,
            title: 'How LifeLink works',
            subtitle: 'Learn about patients, matching, tracking, and payment',
            onTap: () => context.push('/help/caregiver'),
          ),
        ],
      ),
    );
  }
}

class _CaregiverCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _CaregiverCard({
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
