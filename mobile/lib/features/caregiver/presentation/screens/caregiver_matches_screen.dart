import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class CaregiverMatchesScreen extends StatefulWidget {
  final String requestId;

  const CaregiverMatchesScreen({super.key, required this.requestId});

  @override
  State<CaregiverMatchesScreen> createState() => _CaregiverMatchesScreenState();
}

class _CaregiverMatchesScreenState extends State<CaregiverMatchesScreen> {
  late Future<List<DonorMatchModel>> _matches;

  @override
  void initState() {
    super.initState();
    _matches = getIt<CaregiverRemoteDataSource>().getMatches(widget.requestId);
  }

  void _reload() {
    setState(() {
      _matches =
          getIt<CaregiverRemoteDataSource>().getMatches(widget.requestId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Matching donors')),
      body: FutureBuilder<List<DonorMatchModel>>(
        future: _matches,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: FilledButton.icon(
                onPressed: _reload,
                icon: const Icon(Icons.refresh),
                label: Text('Retry: ${snapshot.error}'),
              ),
            );
          }
          final matches = snapshot.data ?? const <DonorMatchModel>[];
          if (matches.isEmpty) {
            return const Center(
              child: Text('No eligible matching donors are available.'),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: matches.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final match = matches[index];
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(child: Text(match.bloodType)),
                    title: Text('Donor ${match.donorId}'),
                    subtitle: Text(
                      match.eligible
                          ? 'Eligible and available'
                          : '${match.eligibilityStatus} · ${match.daysUntilEligible} days remaining',
                    ),
                    trailing: Icon(
                      match.eligible ? Icons.check_circle : Icons.schedule,
                      color: match.eligible ? Colors.green : Colors.orange,
                    ),
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
