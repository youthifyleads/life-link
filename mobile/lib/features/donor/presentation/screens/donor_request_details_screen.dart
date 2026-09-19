import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../blood_requests/data/blood_request_remote_datasource.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';

class DonorRequestDetailsScreen extends StatefulWidget {
  const DonorRequestDetailsScreen({super.key, required this.requestId});

  final String requestId;

  @override
  State<DonorRequestDetailsScreen> createState() =>
      _DonorRequestDetailsScreenState();
}

class _DonorRequestDetailsScreenState extends State<DonorRequestDetailsScreen> {
  late Future<BloodRequestPublic> _requestFuture;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _requestFuture =
        getIt<BloodRequestRemoteDataSource>().getRequestById(widget.requestId);
  }

  Future<void> _offerToDonate() async {
    setState(() => _isSubmitting = true);
    try {
      await getIt<BloodRequestRemoteDataSource>()
          .respondToRequest(widget.requestId, 'accepted');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offer submitted to Azure.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blood request')),
      body: FutureBuilder<BloodRequestPublic>(
        future: _requestFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString()));
          }

          final request = snapshot.data;
          if (request == null) {
            return const Center(child: Text('Blood request unavailable.'));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                '${request.bloodType} · ${request.component}',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text('Units required: ${request.quantityUnits}'),
              Text('Status: ${request.status}'),
              if (request.reason != null) Text('Reason: ${request.reason}'),
              if (request.notes != null) Text('Notes: ${request.notes}'),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _isSubmitting ? null : _offerToDonate,
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : const Text('Offer to Donate'),
              ),
            ],
          );
        },
      ),
    );
  }
}
