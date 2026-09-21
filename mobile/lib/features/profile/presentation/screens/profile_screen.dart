import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/domain/models/user_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_text_field.dart';
import '../../../../core/localization/locale_cubit.dart';
import '../../../../core/di/injection.dart';
import '../../../auth/data/auth_remote_datasource.dart';
import '../../../donor/presentation/utils/donor_hero_slogan_session.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isAr = context.watch<LocaleCubit>().isArabic;

    return Scaffold(
      appBar: LifeLinkDetailAppBar(
        title: isAr ? 'الملف الشخصي والإعدادات' : 'Profile & Settings',
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthLoading) {
            return const Center(
                child: CircularProgressIndicator(color: AppColors.primary));
          }

          if (state is! AuthAuthenticated) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock_outline,
                      size: 64, color: AppColors.textSecondary),
                  const SizedBox(height: 16),
                  Text(
                    isAr
                        ? 'يرجى تسجيل الدخول لعرض الملف الشخصي'
                        : 'Please sign in to view your profile',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.go('/login'),
                    child: Text(isAr ? 'تسجيل الدخول' : 'Sign In'),
                  ),
                ],
              ),
            );
          }

          final user = state.user;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 8),

                // ── Avatar ─────────────────────────────────────────
                CircleAvatar(
                  radius: 44,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    user.fullName.isNotEmpty
                        ? user.fullName[0].toUpperCase()
                        : 'U',
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  user.fullName,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                if (user.phone != null && user.phone!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    user.phone!,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
                const SizedBox(height: 12),

                // Role badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isAr ? user.role.displayNameAr : user.role.name.toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // ── Options List ───────────────────────────────────
                _buildCardGroup([
                  if (user.role.canAccessDonorFeatures)
                    _settingTile(
                      context,
                      icon: Icons.favorite_border_rounded,
                      title: isAr
                          ? 'أهلية وسجل التبرع بالدم'
                          : 'Donation Eligibility & History',
                      subtitle: isAr
                          ? 'فحص نافذة الـ 6 أشهر وسجل التبرعات المعتمد'
                          : 'Check 6-month recovery window and verified donations',
                      onTap: () => context.push('/donor/eligibility'),
                    ),
                  _settingTile(
                    context,
                    icon: Icons.edit_outlined,
                    title: isAr
                        ? 'تعديل البيانات الشخصية'
                        : 'Edit Personal Information',
                    subtitle: isAr
                        ? 'الاسم ورقم الهاتف والبريد الإلكتروني'
                        : 'Name, phone number, and email',
                    onTap: () => _showEditProfile(context, user),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.security_rounded,
                    title: isAr
                        ? 'أمان الحساب وكلمة المرور'
                        : 'Account Security & Password',
                    subtitle: isAr
                        ? 'إعدادات تسجيل الدخول والتوثيق'
                        : 'Login and authentication credentials',
                    onTap: () => _showAccountSecurityInfo(context),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.language_rounded,
                    title: isAr ? 'اللغة / Language' : 'Language / اللغة',
                    subtitle: isAr ? 'العربية' : 'English',
                    onTap: () => _showLanguageBottomSheet(context),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.settings_outlined,
                    title: isAr ? 'إعدادات التطبيق' : 'App Settings',
                    subtitle: isAr
                        ? 'تفضيلات التنبيهات والأمان والمساعدة'
                        : 'Notification, security, and display preferences',
                    onTap: () => _showLanguageBottomSheet(context),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.info_outline_rounded,
                    title: isAr ? 'حول تطبيق LifeLink' : 'About LifeLink',
                    subtitle: isAr
                        ? 'الإصدار 1.0.0 • المنظومة الطبية الذكية لنقل وتبرع الدم'
                        : 'v1.0.0 • Smart Blood Logistics & Cold Chain System',
                    onTap: () => _showAboutDialog(context),
                  ),
                ]),

                const SizedBox(height: 32),

                // ── Logout ─────────────────────────────────────────
                LifeLinkButton(
                  label: isAr ? 'تسجيل الخروج' : 'Log Out',
                  icon: Icons.logout_rounded,
                  isOutlined: true,
                  onPressed: () {
                    DonorHeroSloganSession.resetForNewLogin();
                    context.read<AuthBloc>().add(AuthLogoutEvent());
                    context.go('/login');
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _showEditProfile(BuildContext context, UserModel user) async {
    final nameController = TextEditingController(text: user.fullName);
    final emailController = TextEditingController(text: user.email);
    final phoneController = TextEditingController(text: user.phone ?? '');
    final formKey = GlobalKey<FormState>();
    bool isSaving = false;

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
            contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            actionsPadding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.person_outline_rounded,
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'تعديل البيانات الشخصية',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'Cairo',
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    // 1. Full Name Field
                    LifeLinkTextField(
                      controller: nameController,
                      label: 'الاسم بالكامل',
                      hint: 'مثال: أحمد محمد',
                      prefixIcon: Icons.badge_outlined,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'يرجى إدخال الاسم';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // 2. Email Field
                    LifeLinkTextField(
                      controller: emailController,
                      label: 'البريد الإلكتروني',
                      hint: 'user@lifelink.org',
                      keyboardType: TextInputType.emailAddress,
                      textDirection: TextDirection.ltr,
                      prefixIcon: Icons.email_outlined,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'يرجى إدخال البريد الإلكتروني';
                        }
                        if (!val.contains('@')) {
                          return 'بريد إلكتروني غير صالح';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // 3. Phone Field with proper LTR layout and prefix
                    LifeLinkTextField(
                      controller: phoneController,
                      label: 'رقم الهاتف',
                      hint: '+20 100 000 0000',
                      keyboardType: TextInputType.phone,
                      textDirection: TextDirection.ltr,
                      prefixIcon: Icons.phone_android_rounded,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'يرجى إدخال رقم الهاتف';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
            actions: [
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: isSaving ? null : () => Navigator.pop(dialogContext),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: AppColors.border, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'إلغاء',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'Cairo',
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isSaving
                          ? null
                          : () async {
                              if (!(formKey.currentState?.validate() ?? true)) return;
                              setDialogState(() => isSaving = true);
                              final result = await getIt<AuthRemoteDataSource>().updateProfile(
                                fullName: nameController.text.trim(),
                                email: emailController.text.trim(),
                                phone: phoneController.text.trim(),
                              );
                              if (!dialogContext.mounted) return;
                              if (result is AuthSuccess<UserModel>) {
                                Navigator.pop(dialogContext);
                                context.read<AuthBloc>().add(AuthCheckSessionEvent());
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('تم حفظ البيانات بنجاح'),
                                    backgroundColor: AppColors.success,
                                  ),
                                );
                              } else if (result is AuthFailure<UserModel>) {
                                setDialogState(() => isSaving = false);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(result.message),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'حفظ',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontFamily: 'Cairo',
                                fontSize: 14,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
  }

  Widget _buildCardGroup(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _settingTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: CircleAvatar(
        radius: 18,
        backgroundColor: AppColors.background,
        child: Icon(icon, color: AppColors.textPrimary, size: 20),
      ),
      title: Text(title,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text(subtitle,
          style: const TextStyle(color: AppColors.textHint, fontSize: 12)),
      trailing: Icon(
        Directionality.of(context) == TextDirection.rtl
            ? Icons.chevron_left_rounded
            : Icons.chevron_right_rounded,
        size: 18,
        color: AppColors.textHint,
      ),
      onTap: onTap,
    );
  }

  void _showLanguageBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final localeCubit = context.read<LocaleCubit>();
        final isAr = localeCubit.isArabic;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'اختر لغة التطبيق / Select App Language',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Text('🇪🇬', style: TextStyle(fontSize: 24)),
                title: const Text('العربية (Arabic)',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                trailing: isAr
                    ? const Icon(Icons.check_circle_rounded,
                        color: AppColors.primary)
                    : null,
                onTap: () {
                  localeCubit.changeLocale('ar');
                  Navigator.of(ctx).pop();
                },
              ),
              const Divider(),
              ListTile(
                leading: const Text('🇺🇸', style: TextStyle(fontSize: 24)),
                title: const Text('English (الإنجليزية)',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                trailing: !isAr
                    ? const Icon(Icons.check_circle_rounded,
                        color: AppColors.primary)
                    : null,
                onTap: () {
                  localeCubit.changeLocale('en');
                  Navigator.of(ctx).pop();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAccountSecurityInfo(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('أمان الحساب وكلمة المرور'),
        content: const Text(
          'بيانات حسابك وجلسة تسجيل الدخول مشفرة ومحمية بأعلى معايير الأمان الطبية. '
          'لتغيير كلمة المرور أو تحديث الصلاحيات المعتمدة، يرجى التواصل مع فريق الدعم الفني.',
          style: TextStyle(fontSize: 14, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('حسناً، فهمت'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'LifeLink',
      applicationVersion: '1.0.0',
      applicationLegalese: 'منظومة التبرع ونقل الدم الذكية وحفظ سلسلة التبريد الطبية.',
    );
  }
}
