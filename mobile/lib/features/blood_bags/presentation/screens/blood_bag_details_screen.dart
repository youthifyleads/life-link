import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../data/blood_bag_remote_datasource.dart';
import '../../domain/models/blood_bag_models.dart';

class BloodBagDetailsScreen extends StatelessWidget {
  const BloodBagDetailsScreen({super.key, required this.bag});

  final BloodBagModel bag;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blood bag status')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Blood bag ${bag.id}',
                      style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  _row('Blood type', bag.bloodType),
                  _row('Component', bag.component),
                  _row('Quantity', '${bag.quantity}'),
                  _row('Status', bag.status),
                  if (bag.collectionDate != null)
                    _row('Collected', bag.collectionDate!.toLocal().toString()),
                  if (bag.donationId != null) _row('Donation', bag.donationId!),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (bag.qrCode != null && bag.qrCode!.isNotEmpty)
            FilledButton.icon(
              onPressed: () => context.push('/caregiver/scan'),
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Scan QR for linked request/payment'),
            ),
          OutlinedButton.icon(
            onPressed: () => _showHistory(context),
            icon: const Icon(Icons.history),
            label: const Text('View bag movement history'),
          ),
        ],
      ),
    );
  }

  Future<void> _showHistory(BuildContext context) async {
    try {
      final items = await getIt<BloodBagRemoteDataSource>().history(bag.id);
      if (!context.mounted) return;
      await showModalBottomSheet<void>(
        context: context,
        builder: (_) => SafeArea(
          child: items.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('No movement history returned by Azure.'),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  itemBuilder: (_, index) {
                    final item = items[index];
                    return ListTile(
                      title:
                          Text(item['status']?.toString() ?? 'Status update'),
                      subtitle: Text([
                        if (item['location'] != null)
                          'Location: ${item['location']}',
                        if (item['updated_at'] != null)
                          'Updated: ${item['updated_at']}',
                        if (item['notes'] != null) 'Notes: ${item['notes']}',
                      ].join('\n')),
                    );
                  },
                ),
        ),
      );
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyErrorMessage(error))),
        );
      }
    }
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          children: [
            SizedBox(width: 110, child: Text(label)),
            Expanded(child: Text(value)),
          ],
        ),
      );
}
