import 'package:flutter/material.dart';

import '../../../caregiver/presentation/screens/caregiver_bag_scan_screen.dart';

class BloodBagScannerScreen extends StatelessWidget {
  const BloodBagScannerScreen({super.key, required this.caregiver});

  final bool caregiver;

  @override
  Widget build(BuildContext context) {
    return const CaregiverBagScanScreen();
  }
}
