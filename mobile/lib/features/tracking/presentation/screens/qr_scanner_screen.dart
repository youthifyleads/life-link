import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:go_router/go_router.dart';

import '../bloc/tracking_bloc.dart';
import '../../../../core/theme/app_colors.dart';

/// QR Scanner Screen
/// - Uses [mobile_scanner] to activate the device camera.
/// - NEVER validates the QR payload locally.
/// - Forwards the scanned reference to FastAPI: POST /api/v1/qr/scan
/// - The backend validates authorization and returns only permitted tracking info.
class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _hasScanned = false; // prevents multiple rapid dispatches from one QR

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_hasScanned) return;
    final barcode = capture.barcodes.firstOrNull;
    final rawValue = barcode?.rawValue;
    if (rawValue == null || rawValue.isEmpty) return;

    setState(() => _hasScanned = true);
    _cameraController.stop();

    // Dispatch to BLoC — backend validates everything
    context.read<TrackingBloc>().add(ScanQrEvent(rawValue));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Scan Blood Bag QR',
            style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          // Torch toggle
          IconButton(
            icon: const Icon(Icons.flash_on, color: Colors.white),
            onPressed: () => _cameraController.toggleTorch(),
          ),
          // Camera flip
          IconButton(
            icon: const Icon(Icons.flip_camera_ios, color: Colors.white),
            onPressed: () => _cameraController.switchCamera(),
          ),
        ],
      ),
      body: BlocListener<TrackingBloc, TrackingState>(
        listener: (context, state) {
          if (state is TrackingLoaded) {
            // Navigate to tracking details screen
            context.pushReplacement('/tracking/details', extra: state.tracking);
          } else if (state is TrackingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(state.message),
                  backgroundColor: AppColors.error),
            );
            // Allow re-scanning after error
            setState(() => _hasScanned = false);
            _cameraController.start();
          }
        },
        child: BlocBuilder<TrackingBloc, TrackingState>(
          builder: (context, state) {
            return Stack(
              children: [
                // Camera view
                MobileScanner(
                  controller: _cameraController,
                  onDetect: _onDetect,
                ),

                // Scan overlay
                _buildScanOverlay(),

                // Loading spinner while API resolves
                if (state is TrackingLoading)
                  Container(
                    color: Colors.black.withValues(alpha: 0.6),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text('Verifying QR code...',
                              style: TextStyle(color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildScanOverlay() {
    return LayoutBuilder(builder: (context, constraints) {
      final boxSize = constraints.maxWidth * 0.65;
      final left = (constraints.maxWidth - boxSize) / 2;
      final top = (constraints.maxHeight - boxSize) / 2;

      return Stack(
        children: [
          // Dark overlay
          ColorFiltered(
            colorFilter: ColorFilter.mode(
                Colors.black.withValues(alpha: 0.55), BlendMode.srcOut),
            child: Stack(
              children: [
                Container(
                    decoration: const BoxDecoration(color: Colors.transparent)),
                Positioned(
                  left: left,
                  top: top,
                  child: Container(
                    width: boxSize,
                    height: boxSize,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Corner borders on the scan box
          Positioned(
            left: left,
            top: top,
            child: _buildScanCorners(boxSize),
          ),

          // Instructions
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Column(
              children: [
                const Icon(Icons.qr_code_scanner,
                    color: Colors.white, size: 32),
                const SizedBox(height: 12),
                Text(
                  'Point camera at the blood bag QR code',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9), fontSize: 15),
                ),
              ],
            ),
          ),
        ],
      );
    });
  }

  Widget _buildScanCorners(double size) {
    const borderColor = AppColors.primary;
    const borderWidth = 4.0;
    const borderLength = 28.0;
    const radius = 16.0;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        children: [
          // Top-left
          Positioned(
              top: 0,
              left: 0,
              child: _corner(
                  borderColor, borderWidth, borderLength, radius, 0, 0)),
          // Top-right
          Positioned(
              top: 0,
              right: 0,
              child: _corner(
                  borderColor, borderWidth, borderLength, radius, 0, 1)),
          // Bottom-left
          Positioned(
              bottom: 0,
              left: 0,
              child: _corner(
                  borderColor, borderWidth, borderLength, radius, 1, 0)),
          // Bottom-right
          Positioned(
              bottom: 0,
              right: 0,
              child: _corner(
                  borderColor, borderWidth, borderLength, radius, 1, 1)),
        ],
      ),
    );
  }

  Widget _corner(Color color, double width, double length, double radius,
      int row, int col) {
    return Container(
      width: length,
      height: length,
      decoration: BoxDecoration(
        border: Border(
          top: row == 0
              ? BorderSide(color: color, width: width)
              : BorderSide.none,
          bottom: row == 1
              ? BorderSide(color: color, width: width)
              : BorderSide.none,
          left: col == 0
              ? BorderSide(color: color, width: width)
              : BorderSide.none,
          right: col == 1
              ? BorderSide(color: color, width: width)
              : BorderSide.none,
        ),
        borderRadius: BorderRadius.only(
          topLeft:
              (row == 0 && col == 0) ? Radius.circular(radius) : Radius.zero,
          topRight:
              (row == 0 && col == 1) ? Radius.circular(radius) : Radius.zero,
          bottomLeft:
              (row == 1 && col == 0) ? Radius.circular(radius) : Radius.zero,
          bottomRight:
              (row == 1 && col == 1) ? Radius.circular(radius) : Radius.zero,
        ),
      ),
    );
  }
}
