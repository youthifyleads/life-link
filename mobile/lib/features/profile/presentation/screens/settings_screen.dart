import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../../core/theme/app_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات (Settings)')),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          final flow = state is AuthAuthenticated ? state.appFlow : null;
          final helpRoute =
              flow == 'caregiver' ? '/help/caregiver' : '/help/donor';
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _tile(
                context,
                Icons.person_outline,
                'الملف الشخصي',
                'عرض بيانات الحساب',
                () => context.push('/profile'),
              ),
              _tile(
                context,
                Icons.notifications_none,
                'الإشعارات',
                'عرض الإشعارات وتحديث حالتها',
                () => context.push('/notifications'),
              ),
              _tile(
                context,
                Icons.menu_book_outlined,
                flow == 'caregiver' ? 'دليل مرافق المريض' : 'دليل المتبرع',
                'المساعدة والوظائف المتاحة في مسارك',
                () => context.push(helpRoute),
              ),
              const Divider(height: 32),
              _tile(
                context,
                Icons.logout,
                'تسجيل الخروج',
                'إنهاء الجلسة الحالية',
                () {
                  context.read<AuthBloc>().add(AuthLogoutEvent());
                  context.go('/login');
                },
                color: AppColors.error,
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _tile(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap, {
    Color? color,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.primary),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
