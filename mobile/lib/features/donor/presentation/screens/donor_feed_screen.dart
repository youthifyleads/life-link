import 'package:flutter/material.dart';
import '../../../../core/di/injection.dart';
import '../../data/donor_remote_datasource.dart';
import '../../domain/models/donor_profile_model.dart';
import '../../../blood_requests/data/blood_request_remote_datasource.dart';

class DonorFeedScreen extends StatelessWidget {
  const DonorFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Object>>(
      future: Future.wait<Object>([
        getIt<DonorRemoteDataSource>().getProfile(),
        getIt<DonorRemoteDataSource>().getNearbyRequests(),
      ]),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Donation feed')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        final profile = snapshot.data![0] as DonorProfileModel;
        final requests = snapshot.data![1] as List<NearbyBloodRequest>;
        final eligible = profile.eligibilityStatus.toLowerCase() ==
                'eligible' &&
            (profile.lastDonationDate == null ||
                DateTime.now().difference(profile.lastDonationDate!).inDays >=
                    180);
        return Scaffold(
          appBar: AppBar(title: const Text('Donation feed')),
          body: requests.isEmpty
              ? const Center(
                  child: Text('No blood requests returned by Azure.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: requests.length,
                  itemBuilder: (context, index) {
                    final request = requests[index];
                    return Card(
                      child: ListTile(
                        title:
                            Text('${request.bloodType} · ${request.component}'),
                        subtitle: Text(
                          '${request.hospitalName}\n'
                          '${request.quantityUnits} units'
                          '${request.distanceKm == null ? '' : ' · ${request.distanceKm!.toStringAsFixed(1)} km'}',
                        ),
                        isThreeLine: true,
                        trailing: ElevatedButton(
                          onPressed: eligible
                              ? () => _offer(context, request.requestId)
                              : null,
                          child: const Text('Offer'),
                        ),
                      ),
                    );
                  },
                ),
        );
      },
    );
  }

  Future<void> _offer(BuildContext context, String requestId) async {
    await getIt<BloodRequestRemoteDataSource>()
        .respondToRequest(requestId, 'accepted');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offer submitted to Azure.')),
      );
    }
  }
}
