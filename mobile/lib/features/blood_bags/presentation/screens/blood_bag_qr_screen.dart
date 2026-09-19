import 'package:flutter/material.dart';

class BloodBagQrScreen extends StatelessWidget {
  const BloodBagQrScreen({super.key, required this.bagId});

  final String bagId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blood bag QR')),
      body: Center(child: Text('Bag ID: $bagId')),
    );
  }
}
