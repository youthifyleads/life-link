import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/domain/models/user_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/localization/locale_cubit.dart';
import '../../../../core/di/injection.dart';
import '../../../auth/data/auth_remote_datasource.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي والإعدادات (Profile)'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
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
                  const Text('يرجى تسجيل الدخول لعرض الملف الشخصي',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('تسجيل الدخول'),
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
                    user.role.apiValue.toUpperCase(),
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
                  if (user.role.isDonor)
                    _settingTile(
                      context,
                      icon: Icons.favorite_border_rounded,
                      title: 'أهلية وسجل التبرع (Eligibility & History)',
                      subtitle: 'فحص نافذة الـ 6 أشهر وسجل التبرعات من Azure',
                      onTap: () => context.push('/donor/eligibility'),
                    ),
                  _settingTile(
                    context,
                    icon: Icons.edit_outlined,
                    title: 'تعديل البيانات الشخصية',
                    subtitle: 'الاسم والبريد ورقم الهاتف',
                    onTap: () => _showEditProfile(context, user),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.security_rounded,
                    title: 'أمان الحساب (Account Security)',
                    subtitle: 'إعدادات كلمة المرور والتحقق',
                    onTap: () => _showAccountSecurityInfo(context),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.language_rounded,
                    title: 'Language / اللغة',
                    subtitle: context.watch<LocaleCubit>().isArabic
                        ? 'العربية (Arabic)'
                        : 'English (الإنجليزية)',
                    onTap: () => _showLanguageBottomSheet(context),
                  ),
                  _settingTile(
                    context,
                    icon: Icons.info_outline_rounded,
                    title: 'حول التطبيق (About LifeLink)',
                    subtitle: 'v1.0.0 (FastAPI Azure Cloud Integration)',
                    onTap: () => _showAboutDialog(context),
                  ),
                ]),

                const SizedBox(height: 32),

                // ── Logout ─────────────────────────────────────────
                LifeLinkButton(
                  label: 'تسجيل الخروج (Logout)',
                  icon: Icons.logout_rounded,
                  isOutlined: true,
                  onPressed: () {
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
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تعديل البيانات الشخصية'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'الاسم')),
              TextFormField(
                  controller: emailController,
                  decoration:
                      const InputDecoration(labelText: 'البريد الإلكتروني')),
              TextFormField(
                  controller: phoneController,
                  decoration: const InputDecoration(labelText: 'رقم الهاتف')),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء')),
          FilledButton(
            onPressed: () async {
              if (!(formKey.currentState?.validate() ?? true)) return;
              final result = await getIt<AuthRemoteDataSource>().updateProfile(
                fullName: nameController.text.trim(),
                email: emailController.text.trim(),
                phone: phoneController.text.trim(),
              );
              if (!dialogContext.mounted) return;
              if (result is AuthSuccess<UserModel>) {
                Navigator.pop(dialogContext);
                context.read<AuthBloc>().add(AuthCheckSessionEvent());
              } else if (result is AuthFailure<UserModel>) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text(result.message)));
              }
            },
            child: const Text('حفظ'),
          ),
        ],
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
      trailing: const Icon(Icons.arrow_forward_ios_rounded,
          size: 14, color: AppColors.textHint),
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
        title: const Text('أمان الحساب'),
        content: const Text(
          'تسجيل الدخول والجلسة محميان برمز وصول مخزن بأمان. '
          'إعادة تعيين كلمة المرور غير متاحة من واجهة الخادم الحالية.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('حسناً'),
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
      applicationLegalese: 'Blood donation coordination platform',
    );
  }
}
