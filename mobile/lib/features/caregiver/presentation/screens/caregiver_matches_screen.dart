import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../../core/widgets/lifelink_components.dart';
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
            return const LifeLinkLoadingState(
              message: 'Checking real matching results…',
            );
          }
          if (snapshot.hasError) {
            return LifeLinkStatePanel(
              icon: Icons.cloud_off_rounded,
              title: 'Matching is unavailable',
              message:
                  'The service did not return matching results. Try again when you have a connection.',
              actionLabel: 'Try again',
              onAction: _reload,
              tone: Colors.orange.shade800,
            );
          }
          final matches = snapshot.data ?? const <DonorMatchModel>[];
          if (matches.isEmpty) {
            return const LifeLinkStatePanel(
              icon: Icons.person_search_rounded,
              title: 'No matches available',
              message:
                  'No eligible matching donors were returned for this request.',
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
                return LifeLinkMatchCard(
                  donorLabel: match.fullName?.isNotEmpty == true
                      ? match.fullName!
                      : 'Donor ${match.donorId}',
                  bloodType: match.bloodType,
                  status: match.eligibilityStatus,
                  distance: match.distanceKm != null
                      ? '${match.distanceKm!.toStringAsFixed(1)} km away'
                      : null,
                );
              },
            ),
          );
        },
      ),
    );
  }
}
