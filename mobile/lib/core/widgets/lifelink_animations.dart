import 'package:flutter/material.dart';

/// Calm, gentle entrance animation combining subtle vertical slide and opacity.
/// Conforms to Impeccable Motion principles: quiet, dignified deceleration,
/// micro-offset (6px) to avoid jumpiness, and zero layout thrash.
class LifeLinkFadeSlide extends StatelessWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final double verticalOffset;
  final Curve curve;

  const LifeLinkFadeSlide({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 200),
    this.verticalOffset = 3.0,
    this.curve = Curves.easeOutCubic,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: duration + delay,
      curve: curve,
      builder: (context, progress, child) {
        // Compute effective progress after delay
        final delayedProgress = delay == Duration.zero
            ? progress
            : ((progress - (delay.inMilliseconds / (duration + delay).inMilliseconds)) /
                    (duration.inMilliseconds / (duration + delay).inMilliseconds))
                .clamp(0.0, 1.0);

        final curvedVal = curve.transform(delayedProgress);
        final currentOffset = (1.0 - curvedVal) * verticalOffset;

        return Opacity(
          opacity: curvedVal,
          child: Transform.translate(
            offset: Offset(0, currentOffset),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

/// Tactile pressable micro-interaction wrapper.
/// Scales down very subtly to 0.99 on press and smoothly springs back.
class LifeLinkPressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double pressedScale;

  const LifeLinkPressable({
    super.key,
    required this.child,
    this.onTap,
    this.pressedScale = 0.99,
  });

  @override
  State<LifeLinkPressable> createState() => _LifeLinkPressableState();
}

class _LifeLinkPressableState extends State<LifeLinkPressable> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedScale(
        scale: _isPressed ? widget.pressedScale : 1.0,
        duration: const Duration(milliseconds: 80),
        curve: Curves.easeOutCubic,
        child: widget.child,
      ),
    );
  }
}

/// Calm biological pulsing rhythm for clinical emergency indicators.
/// Uses a barely perceptible scale delta (2%) and a relaxed 3.8-second cycle with 80% resting pause.
class LifeLinkHeartbeat extends StatefulWidget {
  final Widget child;
  final bool isPulsing;
  final double scaleDelta;

  const LifeLinkHeartbeat({
    super.key,
    required this.child,
    bool? enabled,
    bool isPulsing = true,
    this.scaleDelta = 0.02,
  }) : isPulsing = enabled ?? isPulsing;

  @override
  State<LifeLinkHeartbeat> createState() => _LifeLinkHeartbeatState();
}

class _LifeLinkHeartbeatState extends State<LifeLinkHeartbeat>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3800),
    );

    // Ultra-calm pulse: micro expansion (10%), slow return (10%), long resting pause (80%)
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.0 + widget.scaleDelta)
            .chain(CurveTween(curve: Curves.easeOutQuad)),
        weight: 10,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0 + widget.scaleDelta, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOutQuad)),
        weight: 10,
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 80,
      ),
    ]).animate(_controller);

    if (widget.isPulsing) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant LifeLinkHeartbeat oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPulsing != oldWidget.isPulsing) {
      if (widget.isPulsing) {
        _controller.repeat();
      } else {
        _controller.stop();
        _controller.reset();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isPulsing) return widget.child;
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) => Transform.scale(
        scale: _scaleAnimation.value,
        child: child,
      ),
      child: widget.child,
    );
  }
}
