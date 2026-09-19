import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_card.dart';
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
          backgroundColor: AppColors.success,
        ),
      );
    } else if (result is AuthFailure<String>) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: AppColors.error,
        ),
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
          backgroundColor: AppColors.success,
        ),
      );
      context.go('/login');
    } else if (result is AuthFailure<String>) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: AppColors.error,
        ),
      );
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const LifeLinkDetailAppBar(
        title: 'استعادة الحساب',
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
                              Icons.lock_reset_rounded,
                              size: 34,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          _codeSent ? 'تعيين كلمة المرور الجديدة' : 'نسيت كلمة المرور؟',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            fontFamily: 'Cairo',
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          _codeSent
                              ? 'تحقق من بريدك الإلكتروني وأدخل رمز الاستعادة أدناه'
                              : 'أدخل بريدك الإلكتروني المسجل لإرسال رمز إعادة التعيين',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontFamily: 'Cairo',
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),

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
                                const SizedBox(height: AppSpacing.lg),
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
                                  label: 'رمز الاستعادة (Code)',
                                  hint: '123456',
                                  keyboardType: TextInputType.number,
                                  prefixIcon: Icons.pin_outlined,
                                  validator: (v) =>
                                      v == null || v.trim().isEmpty ? 'يرجى إدخال الرمز' : null,
                                ),
                                const SizedBox(height: AppSpacing.md),
                                LifeLinkTextField(
                                  controller: _newPasswordCtrl,
                                  label: 'كلمة المرور الجديدة',
                                  hint: '••••••••',
                                  obscureText: _obscureNew,
                                  prefixIcon: Icons.lock_outline,
                                  suffixIcon: _obscureNew
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  onSuffixTap: () => setState(() => _obscureNew = !_obscureNew),
                                  validator: (v) =>
                                      v != null && v.length >= 8 ? null : 'يجب ألا تقل عن 8 أحرف',
                                ),
                                const SizedBox(height: AppSpacing.md),
                                LifeLinkTextField(
                                  controller: _confirmPasswordCtrl,
                                  label: 'تأكيد كلمة المرور',
                                  hint: '••••••••',
                                  obscureText: _obscureConfirm,
                                  prefixIcon: Icons.lock_outline,
                                  suffixIcon: _obscureConfirm
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  onSuffixTap: () =>
                                      setState(() => _obscureConfirm = !_obscureConfirm),
                                  validator: (v) =>
                                      v == null || v.isEmpty ? 'يرجى تأكيد كلمة المرور' : null,
                                ),
                                const SizedBox(height: AppSpacing.lg),
                                LifeLinkButton(
                                  label: 'حفظ كلمة المرور والدخول',
                                  onPressed: _resetPassword,
                                  isLoading: _loading,
                                  icon: Icons.check_circle_rounded,
                                ),
                                const SizedBox(height: AppSpacing.md),
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
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
