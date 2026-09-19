import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/caregiver_remote_datasource.dart';

class CaregiverBagScanScreen extends StatefulWidget {
  const CaregiverBagScanScreen({super.key});

  @override
  State<CaregiverBagScanScreen> createState() => _CaregiverBagScanScreenState();
}

class _CaregiverBagScanScreenState extends State<CaregiverBagScanScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _scanned = false;
  bool _loading = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _scan(String value) async {
    if (_scanned || value.isEmpty) return;
    setState(() {
      _scanned = true;
      _loading = true;
    });
    await _controller.stop();

    try {
      final result = await getIt<CaregiverRemoteDataSource>().scanBag(value);
      if (!mounted) return;
      await context.push(
        '/caregiver/scan-result',
        extra: result,
      );
      if (!mounted) return;
      setState(() {
        _scanned = false;
        _loading = false;
      });
      await _controller.start();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _scanned = false;
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          backgroundColor: AppColors.error,
        ),
      );
      await _controller.start();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Scan Blood Bag QR'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _controller.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final value = capture.barcodes.firstOrNull?.rawValue;
              if (value != null) _scan(value);
            },
          ),
          if (_loading)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}
