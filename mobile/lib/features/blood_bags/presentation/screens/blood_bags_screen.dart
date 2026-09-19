import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../data/blood_bag_remote_datasource.dart';
import '../../domain/models/blood_bag_models.dart';

class BloodBagsScreen extends StatefulWidget {
  const BloodBagsScreen({super.key});

  @override
  State<BloodBagsScreen> createState() => _BloodBagsScreenState();
}

class _BloodBagsScreenState extends State<BloodBagsScreen> {
  late Future<List<BloodBagModel>> _bags;

  @override
  void initState() {
    super.initState();
    _bags = getIt<BloodBagRemoteDataSource>().list();
  }

  void _reload() =>
      setState(() => _bags = getIt<BloodBagRemoteDataSource>().list());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blood bags')),
      body: FutureBuilder<List<BloodBagModel>>(
        future: _bags,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const LifeLinkLoadingState(message: 'Loading blood bags…');
          }
          if (snapshot.hasError) {
            return LifeLinkStatePanel(
              icon: Icons.cloud_off_rounded,
              title: 'Blood bags could not be loaded',
              message: friendlyErrorMessage(snapshot.error!),
              actionLabel: 'Try again',
              onAction: _reload,
            );
          }
          final bags = snapshot.data ?? const <BloodBagModel>[];
          if (bags.isEmpty) {
            return const LifeLinkStatePanel(
              icon: Icons.inventory_2_outlined,
              title: 'No blood bags returned',
              message: 'Azure did not return any blood bags for this account.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bags.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final bag = bags[index];
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(child: Text(bag.bloodType)),
                    title: Text('${bag.component} · ${bag.quantity} units'),
                    subtitle: Text('ID: ${bag.id}\nStatus: ${bag.status}'),
                    isThreeLine: true,
                    onTap: () =>
                        context.push('/blood-bags/details', extra: bag),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
