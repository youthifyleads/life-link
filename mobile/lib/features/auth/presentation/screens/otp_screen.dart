import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;

  const OtpVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  late final TextEditingController _otpCtrl;
  Timer? _timer;
  int _secondsLeft = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _otpCtrl = TextEditingController();
    _startCountdown();
  }

  void _startCountdown() {
    _timer?.cancel();
    _secondsLeft = 60;
    _canResend = false;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_secondsLeft > 0) {
        setState(() => _secondsLeft--);
      } else {
        setState(() => _canResend = true);
        timer.cancel();
      }
    });
  }

  void _onVerify() {
    final code = _otpCtrl.text.trim();
    if (code.length != 6 || !RegExp(r'^\d{6}$').hasMatch(code)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('يرجى إدخال رمز تحقق OTP مكون من 6 أرقام')),
      );
      return;
    }

    context.read<AuthBloc>().add(
          AuthVerifySignupOtpEvent(
            email: widget.email,
            otp: code,
          ),
        );
  }

  void _onResend() {
    if (!_canResend) return;
    _startCountdown();
    context.read<AuthBloc>().add(AuthResendSignupOtpEvent(widget.email));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          if (state.appFlow == 'caregiver') {
            context.go('/caregiver/home');
          } else if (state.appFlow == 'donor') {
            context.go('/donor/home');
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('دور المستخدم غير مدعوم، تواصل مع الدعم'),
                backgroundColor: AppColors.error,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        }
        if (state is AuthOtpRequiredState) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('تم إرسال رمز تحقق جديد')),
          );
        }
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_rounded),
            onPressed: () => context.pop(),
            color: AppColors.textPrimary,
          ),
          title: const Text('التحقق من الرمز (OTP)'),
        ),
        body: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.mark_email_read_outlined,
                          size: 36, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'تأكيد رمز التحقق (OTP)',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'تم إرسال رمز التحقق إلى بريدك الإلكتروني:\n${widget.email}',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 36),

                  // PIN input
                  TextField(
                    controller: _otpCtrl,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 10,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      hintText: '••••••',
                      hintStyle: TextStyle(
                        color: AppColors.textSecondary.withValues(alpha: 0.3),
                        letterSpacing: 10,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                            color: AppColors.primary, width: 2),
                      ),
                    ),
                    onSubmitted: (_) => _onVerify(),
                  ),

                  const SizedBox(height: 28),

                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) => LifeLinkButton(
                      label: 'تأكيد ودخول',
                      onPressed: _onVerify,
                      isLoading: state is AuthLoading,
                      icon: Icons.check_rounded,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Resend countdown
                  Center(
                    child: _canResend
                        ? TextButton(
                            onPressed: _onResend,
                            child: const Text(
                              'إعادة إرسال الرمز',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          )
                        : Text(
                            'إعادة إرسال الرمز خلال $_secondsLeft ثانية',
                            style:
                                const TextStyle(color: AppColors.textSecondary),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
