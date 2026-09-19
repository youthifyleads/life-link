import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injection.dart';
import '../../data/donor_remote_datasource.dart';

class DonationVoucherScreen extends StatelessWidget {
  const DonationVoucherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<DonationVoucher>>(
      future: getIt<DonorRemoteDataSource>().getVouchers(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Donation vouchers')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        final vouchers = snapshot.data ?? const <DonationVoucher>[];
        return Scaffold(
          appBar: AppBar(title: const Text('Donation vouchers')),
          body: vouchers.isEmpty
              ? const Center(child: Text('No vouchers returned by Azure.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: vouchers.length,
                  itemBuilder: (context, index) {
                    final voucher = vouchers[index];
                    final issued = voucher.issuedAt == null
                        ? ''
                        : '\nIssued: ${DateFormat.yMMMd().format(voucher.issuedAt!.toLocal())}';
                    return Card(
                      child: ListTile(
                        title: Text(voucher.code),
                        subtitle: Text(
                          'Value: ${voucher.value}\n'
                          'Status: ${voucher.status}$issued',
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                ),
        );
      },
    );
  }
}
