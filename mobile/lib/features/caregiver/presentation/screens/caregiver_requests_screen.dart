import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CaregiverRequestsScreen extends StatelessWidget {
  const CaregiverRequestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blood requests')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.person_search_outlined),
              title: const Text('Choose a patient'),
              subtitle: const Text(
                'Create a blood request from a patient returned by Azure.',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/caregiver/patients'),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.add_circle_outline),
              title: const Text('Create request'),
              subtitle: const Text(
                'Use the existing request form and Azure request contract.',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/caregiver/create-request'),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.receipt_long_outlined),
              title: const Text('Payment history'),
              subtitle: const Text(
                'View payment records returned by the caregiver API.',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/caregiver/payment-history'),
            ),
          ),
        ],
      ),
    );
  }
}
