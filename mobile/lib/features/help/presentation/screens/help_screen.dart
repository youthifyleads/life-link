import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HelpScreen extends StatelessWidget {
  final String role;

  const HelpScreen({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    final isDonor = role == 'donor';
    final sections = isDonor
        ? const [
            (
              'Complete your profile',
              'Add your phone, blood type, and availability.'
            ),
            (
              'Verify your blood type',
              'Only verified information should be used for matching.'
            ),
            (
              'Check eligibility',
              'At least six months must pass after your last donation.'
            ),
            (
              'Use Donation Feed',
              'Review compatible requests and respond when you can help.'
            ),
            (
              'Notifications and history',
              'Follow updates and review your past activity.'
            ),
          ]
        : const [
            (
              'Add a patient',
              'Store the patient blood type and request information.'
            ),
            (
              'Create a request',
              'Submit the required component, quantity, urgency, and hospital.'
            ),
            (
              'Review matching',
              'Matching uses blood type, availability, eligibility, and location.'
            ),
            (
              'Track a blood bag',
              'Tracking becomes available only after a real donation is available.'
            ),
            (
              'Payment',
              'Review the amount and payment result returned by the backend.'
            ),
          ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('How LifeLink works'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: sections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final section = sections[index];
          return Card(
            child: ListTile(
              leading: CircleAvatar(child: Text('${index + 1}')),
              title: Text(section.$1,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(section.$2),
            ),
          );
        },
      ),
    );
  }
}
