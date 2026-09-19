import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../../domain/models/user_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;
  final bool isRegistration;
  final Map<String, dynamic>? pendingUserData;
  final String? challengeId;

  const OtpVerificationScreen({
    super.key,
    required this.email,
    this.isRegistration = false,
    this.pendingUserData,
    this.challengeId,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  late final TextEditingController _otpCtrl;
  Timer? _timer;
  late String? _challengeId;
  int _secondsLeft = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _otpCtrl = TextEditingController();
    _challengeId = widget.challengeId;
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
    if (code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال رمز التحقق OTP')),
      );
      return;
    }

    final challengeId = _challengeId;
    if (!widget.isRegistration &&
        (challengeId == null || challengeId.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('جلسة OTP غير صالحة، اطلب رمزًا جديدًا')),
      );
      return;
    }

    context.read<AuthBloc>().add(
          AuthVerifyOtpEvent(
            email: widget.email,
            challengeId: challengeId,
            otp: code,
            isRegistration: widget.isRegistration,
            pendingUserData: widget.pendingUserData,
          ),
        );
  }

  void _onResend() {
    if (!_canResend) return;
    _startCountdown();
    context.read<AuthBloc>().add(AuthResendOtpEvent(
          widget.email,
          purpose: widget.isRegistration ? 'signup' : 'login',
        ));
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
          final role = state.user.role;
          if (role.isCaregiver) {
            context.go('/caregiver/home');
          } else if (role.canAccessDonorFeatures) {
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
        if (state is AuthOtpRequiredState && state.challengeId != null) {
          final otpState = state;
          setState(() => _challengeId = otpState.challengeId);
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
        appBar: const LifeLinkDetailAppBar(
          title: 'التحقق من الهوية',
        ),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.xl,
                ),
                child: Column(
                  children: [
                    LifeLinkCard(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Center(
                            child: Container(
                              width: 68,
                              height: 68,
                              decoration: const BoxDecoration(
                                color: AppColors.primaryLight,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.mark_email_read_outlined,
                                size: 34,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.md),
                          const Text(
                            'تأكيد رمز التحقق (OTP)',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني:\n${widget.email}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              height: 1.4,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xl),

                          // PIN input field
                          TextField(
                            controller: _otpCtrl,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 10,
                              color: AppColors.textPrimary,
                            ),
                            decoration: InputDecoration(
                              counterText: '',
                              hintText: '••••••',
                              fillColor: AppColors.background,
                              filled: true,
                              hintStyle: TextStyle(
                                color: AppColors.textSecondary.withValues(alpha: 0.3),
                                letterSpacing: 10,
                              ),
                              border: const OutlineInputBorder(
                                borderRadius: AppRadii.md,
                                borderSide: BorderSide(color: AppColors.border),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderRadius: AppRadii.md,
                                borderSide: BorderSide(
                                  color: AppColors.primary,
                                  width: 1.5,
                                ),
                              ),
                            ),
                            onSubmitted: (_) => _onVerify(),
                          ),

                          const SizedBox(height: AppSpacing.lg),

                          BlocBuilder<AuthBloc, AuthState>(
                            builder: (context, state) => LifeLinkButton(
                              label: 'تأكيد ودخول',
                              onPressed: _onVerify,
                              isLoading: state is AuthLoading,
                              icon: Icons.check_rounded,
                            ),
                          ),

                          const SizedBox(height: AppSpacing.md),

                          // Resend countdown
                          Center(
                            child: _canResend
                                ? TextButton(
                                    onPressed: _onResend,
                                    child: const Text(
                                      'إعادة إرسال الرمز',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w700,
                                        fontFamily: 'Cairo',
                                      ),
                                    ),
                                  )
                                : Text(
                                    'إعادة إرسال الرمز خلال $_secondsLeft ثانية',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                      fontFamily: 'Cairo',
                                    ),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
