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
        title: const Text('مسح كود طلب المستشفى',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: Icon(Icons.adaptive.arrow_back, color: Colors.white),
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
            icon: const Icon(Icons.cameraswitch_rounded, color: Colors.white),
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
                          Text('جاري فحص كود الطلب وبيانات المستشفى...',
                              style: TextStyle(color: Colors.white, fontSize: 15)),
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

  void _showManualInputDialog() {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(modalContext).viewInsets.bottom,
        ),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'إدخال كود الطلب يدوياً',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'إذا تعذر استخدام الكاميرا أو للمحاكي، يمكنك إدخال رقم الطلب أو كود التتبع يدوياً',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: controller,
                autofocus: true,
                textDirection: TextDirection.ltr,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
                decoration: InputDecoration(
                  hintText: 'REQ-8820-EG',
                  prefixIcon: const Icon(Icons.pin_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  final code = controller.text.trim();
                  if (code.isNotEmpty) {
                    Navigator.pop(modalContext);
                    context.push('/tracking', extra: code);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'تأكيد والبحث عن الشحنة',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
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

          // Instructions & Manual Code Action
          Positioned(
            bottom: 36,
            left: 24,
            right: 24,
            child: Column(
              children: [
                const Icon(Icons.qr_code_scanner,
                    color: Colors.white, size: 36),
                const SizedBox(height: 10),
                const Text(
                  'وجّه الكاميرا نحو كود طلب الدم',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'المطبوع في إذن صرف المستشفى أو المعروض على شاشة الطبيب',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: _showManualInputDialog,
                  icon: const Icon(Icons.keyboard_outlined, color: Colors.white, size: 18),
                  label: const Text(
                    'إدخال كود الطلب يدوياً كرقم',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white70, width: 1.5),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    backgroundColor: Colors.black.withValues(alpha: 0.3),
                  ),
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
