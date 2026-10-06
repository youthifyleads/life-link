import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:go_router/go_router.dart';

import '../bloc/tracking_bloc.dart';
import '../../../../core/theme/app_colors.dart';

/// QR Scanner Screen
/// - Uses [mobile_scanner] to activate the device camera.
/// - Explicitly requests and verifies Camera runtime permissions.
/// - Handles application lifecycle (resumed/paused) cleanly.
/// - NEVER validates the QR payload locally.
/// - Forwards the scanned reference to FastAPI: POST /api/v1/qr/scan
class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen>
    with WidgetsBindingObserver {
  late final MobileScannerController _cameraController;
  bool _hasScanned = false; // prevents multiple rapid dispatches from one QR
  bool _isPermissionChecking = true;
  bool _isPermissionGranted = false;
  bool _isPermissionPermanentlyDenied = false;
  bool _isCameraStarted = false;
  String? _cameraErrorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _cameraController = MobileScannerController(
      autoStart: false,
      detectionSpeed: DetectionSpeed.noDuplicates,
      formats: const [BarcodeFormat.qrCode],
    );

    _checkAndRequestPermission();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        // When coming back from background or Phone Settings, re-check permissions and restart camera
        _checkAndRequestPermission(isLifecycleResume: true);
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        if (_isCameraStarted) {
          try {
            _cameraController.stop();
          } catch (_) {}
          _isCameraStarted = false;
        }
        break;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    try {
      _cameraController.dispose();
    } catch (_) {}
    super.dispose();
  }

  Future<void> _checkAndRequestPermission({bool isLifecycleResume = false}) async {
    final status = await Permission.camera.status;

    if (status.isGranted) {
      if (mounted) {
        setState(() {
          _isPermissionGranted = true;
          _isPermissionChecking = false;
          _isPermissionPermanentlyDenied = false;
        });
        _startCamera();
      }
      return;
    }

    if (isLifecycleResume) {
      // Just check status on resume without repeatedly spamming the system dialog
      if (mounted) {
        setState(() {
          _isPermissionGranted = status.isGranted;
          _isPermissionChecking = false;
          _isPermissionPermanentlyDenied = status.isPermanentlyDenied;
        });
      }
      return;
    }

    if (status.isPermanentlyDenied) {
      if (mounted) {
        setState(() {
          _isPermissionGranted = false;
          _isPermissionChecking = false;
          _isPermissionPermanentlyDenied = true;
        });
      }
      return;
    }

    // Request permission from the user
    final result = await Permission.camera.request();
    if (mounted) {
      setState(() {
        _isPermissionGranted = result.isGranted;
        _isPermissionChecking = false;
        _isPermissionPermanentlyDenied = result.isPermanentlyDenied;
      });

      if (result.isGranted) {
        _startCamera();
      }
    }
  }

  Future<void> _startCamera() async {
    if (_isCameraStarted) return;
    try {
      setState(() => _cameraErrorMessage = null);
      await _cameraController.start();
      _isCameraStarted = true;
    } catch (e) {
      if (mounted) {
        setState(() {
          _cameraErrorMessage = e.toString();
          _isCameraStarted = false;
        });
      }
    }
  }

  void _onProcessCode(String code, {bool force = false}) {
    if (_hasScanned && !force) return;
    setState(() => _hasScanned = true);
    try {
      _cameraController.stop();
      _isCameraStarted = false;
    } catch (_) {}
    context.read<TrackingBloc>().add(ScanQrEvent(code));
  }

  void _onDetect(BarcodeCapture capture) {
    if (_hasScanned) return;
    final barcode = capture.barcodes.firstOrNull;
    final rawValue = barcode?.rawValue;
    if (rawValue == null || rawValue.isEmpty) return;
    _onProcessCode(rawValue);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Flexible(
              child: Text(
                'مسح الفاتورة وسداد Paymob',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(5),
              ),
              child: const Text(
                'Paymob',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 9.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.adaptive.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (_isPermissionGranted) ...[
            // Torch toggle
            IconButton(
              icon: const Icon(Icons.flash_on, color: Colors.white),
              onPressed: () {
                try {
                  _cameraController.toggleTorch();
                } catch (_) {}
              },
            ),
            // Camera flip
            IconButton(
              icon: const Icon(Icons.cameraswitch_rounded, color: Colors.white),
              onPressed: () {
                try {
                  _cameraController.switchCamera();
                } catch (_) {}
              },
            ),
          ],
        ],
      ),
      body: BlocListener<TrackingBloc, TrackingState>(
        listener: (context, state) {
          debugPrint('QR_SCAN_STATE: $state');
          if (state is TrackingLoaded) {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop(state.tracking);
            } else if (!state.tracking.isPaid && state.tracking.totalPrice != null && state.tracking.totalPrice! > 0) {
              context.pushReplacement('/caregiver/payment', extra: state.tracking);
            } else {
              context.pushReplacement('/tracking/details', extra: state.tracking);
            }
          } else if (state is TrackingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
            // Allow re-scanning after error
            setState(() => _hasScanned = false);
            _startCamera();
          }
        },
        child: BlocBuilder<TrackingBloc, TrackingState>(
          builder: (context, state) {
            Widget bodyContent;

            if (_isPermissionChecking) {
              bodyContent = const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: AppColors.primary),
                    SizedBox(height: 16),
                    Text(
                      'جاري التحقق من إذن الكاميرا...',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  ],
                ),
              );
            } else if (!_isPermissionGranted) {
              bodyContent = _buildPermissionDeniedView();
            } else {
              bodyContent = Stack(
                children: [
                  // Camera view
                  MobileScanner(
                    controller: _cameraController,
                    onDetect: _onDetect,
                    errorBuilder: (context, error, child) {
                      return _buildScannerErrorView(error);
                    },
                  ),

                  // Scan overlay with clear cutout hole
                  _buildScanOverlay(),
                ],
              );
            }

            return Stack(
              children: [
                bodyContent,

                // Loading spinner while API resolves
                if (state is TrackingLoading)
                  Container(
                    color: Colors.black.withValues(alpha: 0.65),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text(
                            'جاري فحص كود الطلب وبيانات المستشفى...',
                            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
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

  Widget _buildPermissionDeniedView() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 2),
              ),
              child: const Icon(
                Icons.camera_alt_outlined,
                color: AppColors.primary,
                size: 52,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'إذن الكاميرا مطلوب',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'يحتاج تطبيق LifeLink إذن الوصول للكاميرا لمسح باركود طلب الدم وفواتير الصرف المعتمدة بالمستشفيات.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 28),
            if (_isPermissionPermanentlyDenied)
              ElevatedButton.icon(
                onPressed: () async {
                  await openAppSettings();
                },
                icon: const Icon(Icons.settings_rounded, size: 20),
                label: const Text(
                  'فتح إعدادات الهاتف لتفعيل الكاميرا',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: () => _checkAndRequestPermission(),
                icon: const Icon(Icons.security_rounded, size: 20),
                label: const Text(
                  'السماح باستخدام الكاميرا',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: _showManualInputDialog,
              icon: const Icon(Icons.keyboard_outlined, color: Colors.white, size: 18),
              label: const Text(
                'إدخال كود الطلب يدوياً كرقم',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                side: const BorderSide(color: Colors.white60, width: 1.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerErrorView(MobileScannerException error) {
    String message = _cameraErrorMessage ?? 'تعذر تشغيل الكاميرا';
    bool isPermission = false;

    if (error.errorCode == MobileScannerErrorCode.permissionDenied) {
      message = 'تم رفض إذن الكاميرا';
      isPermission = true;
    } else if (error.errorCode == MobileScannerErrorCode.unsupported) {
      message = 'الكاميرا غير مدعومة على هذا الجهاز';
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.videocam_off_rounded, color: Colors.white70, size: 48),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'يمكنك إعادة المحاولة أو إدخال رقم الطلب يدوياً بدون كاميرا',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 24),
            if (isPermission)
              ElevatedButton.icon(
                onPressed: () async {
                  await openAppSettings();
                },
                icon: const Icon(Icons.settings_rounded, size: 18),
                label: const Text('فتح إعدادات الهاتف'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: () async {
                  try {
                    await _cameraController.stop();
                  } catch (_) {}
                  _isCameraStarted = false;
                  _startCamera();
                },
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('إعادة تشغيل الكاميرا'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _showManualInputDialog,
              icon: const Icon(Icons.keyboard_outlined, color: Colors.white, size: 18),
              label: const Text('إدخال كود الطلب يدوياً', style: TextStyle(color: Colors.white)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.white54),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
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
      builder: (modalContext) => GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => Navigator.pop(modalContext),
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(modalContext).viewInsets.bottom,
          ),
          child: Align(
            alignment: Alignment.bottomCenter,
            child: GestureDetector(
              onTap: () {},
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(24, 14, 24, 24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const SizedBox(width: 24),
                          Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.grey.shade300,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20, color: Color(0xFF94A3B8)),
                            onPressed: () => Navigator.pop(modalContext),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
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
                        autofocus: false,
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
                      ElevatedButton.icon(
                        onPressed: () {
                          final code = controller.text.trim();
                          if (code.isNotEmpty) {
                            Navigator.pop(modalContext);
                            _onProcessCode(code, force: true);
                          }
                        },
                        icon: const Icon(Icons.lock_outline_rounded, size: 18),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        label: const Text(
                          'تأكيد الكود والانتقال للسداد عبر Paymob',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScanOverlay() {
    return LayoutBuilder(builder: (context, constraints) {
      final boxSize = (constraints.maxWidth * 0.68).clamp(240.0, 320.0);
      final left = (constraints.maxWidth - boxSize) / 2;
      final top = (constraints.maxHeight - boxSize) / 2.3;
      final scanRect = Rect.fromLTWH(left, top, boxSize, boxSize);

      return Stack(
        children: [
          // Clear hardware cutout overlay that won't invert or black-out on Android textures
          CustomPaint(
            size: Size(constraints.maxWidth, constraints.maxHeight),
            painter: _ScannerCutoutPainter(
              cutoutRect: scanRect,
              borderRadius: 16.0,
              overlayColor: Colors.black.withValues(alpha: 0.58),
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
                const Icon(Icons.qr_code_scanner, color: Colors.white, size: 36),
                const SizedBox(height: 10),
                const Text(
                  'وجّه الكاميرا نحو كود طلب الدم',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'المطبوع في إذن صرف المستشفى أو المعروض على شاشة الطبيب',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontSize: 13,
                  ),
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
                    backgroundColor: Colors.black.withValues(alpha: 0.35),
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
            child: _corner(borderColor, borderWidth, borderLength, radius, 0, 0),
          ),
          // Top-right
          Positioned(
            top: 0,
            right: 0,
            child: _corner(borderColor, borderWidth, borderLength, radius, 0, 1),
          ),
          // Bottom-left
          Positioned(
            bottom: 0,
            left: 0,
            child: _corner(borderColor, borderWidth, borderLength, radius, 1, 0),
          ),
          // Bottom-right
          Positioned(
            bottom: 0,
            right: 0,
            child: _corner(borderColor, borderWidth, borderLength, radius, 1, 1),
          ),
        ],
      ),
    );
  }

  Widget _corner(Color color, double width, double length, double radius, int row, int col) {
    return Container(
      width: length,
      height: length,
      decoration: BoxDecoration(
        border: Border(
          top: row == 0 ? BorderSide(color: color, width: width) : BorderSide.none,
          bottom: row == 1 ? BorderSide(color: color, width: width) : BorderSide.none,
          left: col == 0 ? BorderSide(color: color, width: width) : BorderSide.none,
          right: col == 1 ? BorderSide(color: color, width: width) : BorderSide.none,
        ),
        borderRadius: BorderRadius.only(
          topLeft: (row == 0 && col == 0) ? Radius.circular(radius) : Radius.zero,
          topRight: (row == 0 && col == 1) ? Radius.circular(radius) : Radius.zero,
          bottomLeft: (row == 1 && col == 0) ? Radius.circular(radius) : Radius.zero,
          bottomRight: (row == 1 && col == 1) ? Radius.circular(radius) : Radius.zero,
        ),
      ),
    );
  }
}

/// A CustomPainter that cleanly punches a rounded cutout hole out of a dark overlay.
/// Unlike BlendMode.srcOut, this works reliably across all Android GPUs, Impeller, and Skia
/// without inverting or blacking out underlying camera texture views.
class _ScannerCutoutPainter extends CustomPainter {
  final Rect cutoutRect;
  final double borderRadius;
  final Color overlayColor;

  _ScannerCutoutPainter({
    required this.cutoutRect,
    required this.borderRadius,
    required this.overlayColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final backgroundPath = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    final cutoutPath = Path()
      ..addRRect(
        RRect.fromRectAndRadius(cutoutRect, Radius.circular(borderRadius)),
      );

    final finalPath = Path.combine(PathOperation.difference, backgroundPath, cutoutPath);

    final paint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    canvas.drawPath(finalPath, paint);
  }

  @override
  bool shouldRepaint(covariant _ScannerCutoutPainter oldDelegate) {
    return oldDelegate.cutoutRect != cutoutRect ||
        oldDelegate.borderRadius != borderRadius ||
        oldDelegate.overlayColor != overlayColor;
  }
}
