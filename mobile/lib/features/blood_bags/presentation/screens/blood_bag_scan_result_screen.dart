import 'package:flutter/material.dart';

import '../../domain/models/blood_bag_models.dart';

class BloodBagScanResultScreen extends StatelessWidget {
  const BloodBagScanResultScreen({super.key, required this.result});

  final BloodBagScanResult result;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan result')),
      body: Center(child: Text('Bag: ${result.bloodBag.id}')),
    );
  }
}
