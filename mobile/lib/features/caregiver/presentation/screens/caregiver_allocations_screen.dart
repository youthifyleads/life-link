import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../data/caregiver_remote_datasource.dart';

class CaregiverAllocationsScreen extends StatelessWidget {
  const CaregiverAllocationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: getIt<CaregiverRemoteDataSource>().getAllocations(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Allocations')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        final items = snapshot.data ?? const <Map<String, dynamic>>[];
        return Scaffold(
          appBar: AppBar(title: const Text('Allocations')),
          body: items.isEmpty
              ? const Center(child: Text('No allocations returned by Azure.'))
              : ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return ListTile(
                      title: Text(item['id']?.toString() ?? 'Allocation'),
                      subtitle: Text(
                        'Status: ${item['status']?.toString() ?? 'Not provided'}',
                      ),
                    );
                  },
                ),
        );
      },
    );
  }
}
