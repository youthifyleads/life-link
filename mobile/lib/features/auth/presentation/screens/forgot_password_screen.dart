import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_text_field.dart';
import '../../../../core/di/injection.dart';
import '../../data/auth_remote_datasource.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  bool _codeSent = false;
  bool _loading = false;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codeCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendResetCode() async {
    if (!_emailFormKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final result = await getIt<AuthRemoteDataSource>().forgotPassword(
      _emailCtrl.text.trim(),
    );
    if (!mounted) return;
    if (result is AuthSuccess<String>) {
      setState(() => _codeSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.data),
          backgroundColor: Colors.green,
        ),
      );
    } else if (result is AuthFailure<String>) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(result.message), backgroundColor: AppColors.error),
      );
    }
    setState(() => _loading = false);
  }

  Future<void> _resetPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;
    if (_newPasswordCtrl.text != _confirmPasswordCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('كلمتا المرور غير متطابقتين'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _loading = true);
    final result = await getIt<AuthRemoteDataSource>().resetPassword(
      email: _emailCtrl.text.trim(),
      code: _codeCtrl.text.trim(),
      newPassword: _newPasswordCtrl.text,
    );
    if (!mounted) return;
    if (result is AuthSuccess<String>) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.data),
          backgroundColor: Colors.green,
        ),
      );
      context.go('/login');
    } else if (result is AuthFailure<String>) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(result.message), backgroundColor: AppColors.error),
      );
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
          color: AppColors.textPrimary,
        ),
        title: const Text(
          'استعادة كلمة المرور',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
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
                      child: const Icon(Icons.lock_reset_rounded,
                          size: 36, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _codeSent ? 'أدخل رمز الاستعادة' : 'نسيت كلمة المرور؟',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _codeSent
                        ? 'تحقق من بريدك الإلكتروني وأدخل الرمز أدناه مع كلمة المرور الجديدة'
                        : 'أدخل بريدك الإلكتروني المسجل لاستلام رمز الاستعادة',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 32),
                  if (!_codeSent)
                    Form(
                      key: _emailFormKey,
                      child: Column(
                        children: [
                          LifeLinkTextField(
                            controller: _emailCtrl,
                            label: 'البريد الإلكتروني المسجل (Email)',
                            hint: 'name@example.com',
                            keyboardType: TextInputType.emailAddress,
                            prefixIcon: Icons.email_outlined,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'يرجى إدخال البريد الإلكتروني';
                              }
                              if (!v.contains('@')) {
                                return 'بريد إلكتروني غير صالح';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 28),
                          LifeLinkButton(
                            label: 'إرسال رمز الاستعادة',
                            onPressed: _sendResetCode,
                            isLoading: _loading,
                            icon: Icons.send_rounded,
                          ),
                        ],
                      ),
                    ),
                  if (_codeSent)
                    Form(
                      key: _resetFormKey,
                      child: Column(
                        children: [
                          LifeLinkTextField(
                            controller: _codeCtrl,
                            label: 'رمز الاستعادة (Reset Code)',
                            hint: 'رمز التحقق',
                            keyboardType: TextInputType.number,
                            prefixIcon: Icons.pin_outlined,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'يرجى إدخال رمز الاستعادة';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          LifeLinkTextField(
                            controller: _newPasswordCtrl,
                            label: 'كلمة المرور الجديدة',
                            hint: '••••••••',
                            obscureText: _obscureNew,
                            prefixIcon: Icons.lock_outline,
                            suffixIcon: _obscureNew
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            onSuffixTap: () =>
                                setState(() => _obscureNew = !_obscureNew),
                            validator: (v) {
                              if (v == null || v.isEmpty) {
                                return 'يرجى إدخال كلمة المرور الجديدة';
                              }
                              if (v.length < 8) {
                                return 'يجب أن تكون 8 أحرف على الأقل';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          LifeLinkTextField(
                            controller: _confirmPasswordCtrl,
                            label: 'تأكيد كلمة المرور',
                            hint: '••••••••',
                            obscureText: _obscureConfirm,
                            prefixIcon: Icons.lock_outline,
                            suffixIcon: _obscureConfirm
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            onSuffixTap: () => setState(
                                () => _obscureConfirm = !_obscureConfirm),
                            validator: (v) {
                              if (v == null || v.isEmpty) {
                                return 'يرجى تأكيد كلمة المرور';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 28),
                          LifeLinkButton(
                            label: 'تغيير كلمة المرور',
                            onPressed: _resetPassword,
                            isLoading: _loading,
                            icon: Icons.check_circle_outline_rounded,
                          ),
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: () => setState(() => _codeSent = false),
                            child: const Text('لم يصل الرمز؟ إعادة الإرسال'),
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
    );
  }
}
