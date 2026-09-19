import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../../domain/models/user_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/lifelink_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _onLogin() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
          AuthLoginEvent(_emailCtrl.text.trim(), _passwordCtrl.text),
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthOtpRequiredState) {
          context.push('/otp', extra: {
            'email': state.email,
            'isRegistration': state.isRegistration,
            'pendingUserData': state.pendingUserData,
            'challengeId': state.challengeId,
          });
        }
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
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.xl,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      const SizedBox(height: AppSpacing.md),

                      // Brand Logo (Frameless, simplified, prominent)
                      Image.asset(
                        'assets/images/logo.webp',
                        height: 120,
                        fit: BoxFit.contain,
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Modern Clinical Login Card
                      LifeLinkCard(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'تسجيل الدخول',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'أدخل بريدك الإلكتروني وكلمة المرور للمتابعة',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            const SizedBox(height: AppSpacing.lg),

                            LifeLinkTextField(
                              controller: _emailCtrl,
                              label: 'البريد الإلكتروني',
                              hint: 'name@example.com',
                              keyboardType: TextInputType.emailAddress,
                              prefixIcon: Icons.email_outlined,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.username],
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) {
                                  return 'يرجى إدخال البريد الإلكتروني';
                                }
                                if (!v.contains('@')) return 'بريد إلكتروني غير صالح';
                                return null;
                              },
                            ),
                            const SizedBox(height: AppSpacing.md),

                            LifeLinkTextField(
                              controller: _passwordCtrl,
                              label: 'كلمة المرور',
                              hint: '••••••••',
                              obscureText: _obscurePassword,
                              prefixIcon: Icons.lock_outline_rounded,
                              suffixIcon: _obscurePassword
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                              onSuffixTap: () => setState(
                                  () => _obscurePassword = !_obscurePassword),
                              textInputAction: TextInputAction.done,
                              autofillHints: const [AutofillHints.password],
                              onFieldSubmitted: (_) => _onLogin(),
                              validator: (v) {
                                if (v == null || v.isEmpty) {
                                  return 'يرجى إدخال كلمة المرور';
                                }
                                if (v.length < 6) {
                                  return 'يجب أن تكون 6 أحرف على الأقل';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: AppSpacing.xs),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: TextButton(
                                onPressed: () => context.push('/forgot-password'),
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: const Text(
                                  'نسيت كلمة المرور؟',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: AppSpacing.lg),

                            BlocBuilder<AuthBloc, AuthState>(
                              builder: (context, state) {
                                return LifeLinkButton(
                                  label: 'تسجيل الدخول',
                                  onPressed: _onLogin,
                                  isLoading: state is AuthLoading,
                                  icon: Icons.login_rounded,
                                );
                              },
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Sign Up Prompt
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'ليس لديك حساب بعد؟',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          const SizedBox(width: 4),
                          TextButton(
                            onPressed: () => context.push('/register'),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                            ),
                            child: const Text(
                              'إنشاء حساب جديد',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                                fontSize: 13,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: AppSpacing.sm),

                      // Quick preview shortcuts for testing
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton.icon(
                            icon: const Icon(Icons.water_drop_rounded, size: 15, color: AppColors.primary),
                            label: const Text(
                              'معاينة كمتبرع',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            onPressed: () {
                              context.read<AuthBloc>().add(AuthSetDemoUserEvent(UserRole.donor));
                              context.go('/donor/home');
                            },
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 4),
                            child: Text('•', style: TextStyle(color: AppColors.border)),
                          ),
                          TextButton.icon(
                            icon: const Icon(Icons.favorite_rounded, size: 15, color: AppColors.textSecondary),
                            label: const Text(
                              'معاينة كمرافق',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textSecondary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            onPressed: () {
                              context.read<AuthBloc>().add(AuthSetDemoUserEvent(UserRole.caregiver));
                              context.go('/caregiver/home');
                            },
                          ),
                        ],
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
}
