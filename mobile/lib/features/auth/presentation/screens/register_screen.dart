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
import '../../../../core/widgets/lifelink_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  UserRole _selectedRole = UserRole.donor;
  String _selectedBloodType = 'O+';
  String _selectedGovernorate = 'القاهرة (Cairo)';
  bool _obscurePassword = true;
  bool _hasAgreedConsent = false;

  final List<String> _bloodTypes = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];
  final List<String> _governorates = [
    'القاهرة (Cairo)',
    'الجيزة (Giza)',
    'الإسكندرية (Alexandria)',
    'الدقهلية (Dakahlia)',
    'الشرقية (Sharqia)',
    'الغربية (Gharbia)',
    'المنوفية (Menofia)',
    'القليوبية (Qalyubia)',
    'البحيرة (Beheira)',
    'أسيوط (Asyut)',
    'سوهاج (Sohag)',
    'قنا (Qena)',
    'الأقصر (Luxor)',
    'أسوان (Aswan)',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _dobCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;

    if (!_hasAgreedConsent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يجب الموافقة على الشروط والإقرار الطبي للمتابعة'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    context.read<AuthBloc>().add(
          AuthRegisterEvent(
            fullName: _nameCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            phone: _phoneCtrl.text.trim(),
            dateOfBirth: _dobCtrl.text.trim(),
            password: _passwordCtrl.text,
            role: _selectedRole,
            bloodType:
                _selectedRole == UserRole.donor ? _selectedBloodType : null,
            governorate: _selectedGovernorate,
          ),
        );
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 25),
      firstDate: DateTime(now.year - 80),
      lastDate: DateTime(now.year - 18),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      final formatted =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      setState(() => _dobCtrl.text = formatted);
    }
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
          if (state.user.role.isCaregiver) {
            context.go('/caregiver/home');
          } else {
            context.go('/donor/home');
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
        appBar: const LifeLinkDetailAppBar(
          title: 'إنشاء حساب جديد',
        ),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.lg,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Role Selection Segmented Bar
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: AppRadii.md,
                          boxShadow: AppShadows.soft,
                          border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                borderRadius: AppRadii.sm,
                                onTap: () => setState(() => _selectedRole = UserRole.donor),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _selectedRole == UserRole.donor
                                        ? AppColors.primaryLight
                                        : Colors.transparent,
                                    borderRadius: AppRadii.sm,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.volunteer_activism_rounded,
                                        size: 16,
                                        color: _selectedRole == UserRole.donor
                                            ? AppColors.primary
                                            : AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        'متبرع بالدم',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13,
                                          color: _selectedRole == UserRole.donor
                                              ? AppColors.primary
                                              : AppColors.textSecondary,
                                          fontFamily: 'Cairo',
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: InkWell(
                                borderRadius: AppRadii.sm,
                                onTap: () => setState(() => _selectedRole = UserRole.caregiver),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _selectedRole == UserRole.caregiver
                                        ? AppColors.secondaryBlueLight
                                        : Colors.transparent,
                                    borderRadius: AppRadii.sm,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.family_restroom_rounded,
                                        size: 16,
                                        color: _selectedRole == UserRole.caregiver
                                            ? AppColors.secondaryBlue
                                            : AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        'مرافق مريض',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13,
                                          color: _selectedRole == UserRole.caregiver
                                              ? AppColors.secondaryBlue
                                              : AppColors.textSecondary,
                                          fontFamily: 'Cairo',
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Form Card
                      LifeLinkCard(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            LifeLinkTextField(
                              controller: _nameCtrl,
                              label: 'الاسم الكامل',
                              hint: 'أحمد محمود',
                              prefixIcon: Icons.person_outline,
                              validator: (v) =>
                                  v == null || v.trim().isEmpty ? 'يرجى إدخال الاسم الكامل' : null,
                            ),
                            const SizedBox(height: AppSpacing.md),

                            LifeLinkTextField(
                              controller: _emailCtrl,
                              label: 'البريد الإلكتروني',
                              hint: 'you@example.com',
                              keyboardType: TextInputType.emailAddress,
                              prefixIcon: Icons.email_outlined,
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'يرجى إدخال البريد الإلكتروني';
                                if (!v.contains('@')) return 'بريد إلكتروني غير صالح';
                                return null;
                              },
                            ),
                            const SizedBox(height: AppSpacing.md),

                            LifeLinkTextField(
                              controller: _phoneCtrl,
                              label: 'رقم الهاتف المحمول',
                              hint: '01012345678',
                              keyboardType: TextInputType.phone,
                              prefixIcon: Icons.phone_outlined,
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'يرجى إدخال رقم الهاتف';
                                if (v.replaceAll(RegExp(r'[^0-9]'), '').length < 10) {
                                  return 'رقم هاتف غير صحيح';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: AppSpacing.md),

                            LifeLinkTextField(
                              controller: _dobCtrl,
                              label: 'تاريخ الميلاد',
                              hint: 'YYYY-MM-DD (من 18 إلى 65 سنة)',
                              readOnly: true,
                              onTap: _pickDateOfBirth,
                              prefixIcon: Icons.calendar_today_outlined,
                              validator: (v) =>
                                  v == null || v.isEmpty ? 'يرجى تحديد تاريخ الميلاد' : null,
                            ),
                            const SizedBox(height: AppSpacing.md),

                            // Blood Type chips (shown for donors)
                            if (_selectedRole == UserRole.donor) ...[
                              const Text(
                                'فصيلة الدم',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                  fontFamily: 'Cairo',
                                ),
                              ),
                              const SizedBox(height: AppSpacing.xs),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _bloodTypes.map((type) {
                                  final isSelected = _selectedBloodType == type;
                                  return ChoiceChip(
                                    label: Text(
                                      type,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: isSelected ? Colors.white : AppColors.textPrimary,
                                        fontFamily: 'Cairo',
                                      ),
                                    ),
                                    selected: isSelected,
                                    selectedColor: AppColors.primary,
                                    backgroundColor: AppColors.surfaceVariant,
                                    shape: const RoundedRectangleBorder(borderRadius: AppRadii.sm),
                                    side: BorderSide(
                                      color: isSelected ? AppColors.primary : Colors.transparent,
                                    ),
                                    onSelected: (selected) {
                                      if (selected) setState(() => _selectedBloodType = type);
                                    },
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: AppSpacing.md),
                            ],

                            // Governorate Dropdown
                            const Text(
                              'المحافظة',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedGovernorate,
                              decoration: const InputDecoration(
                                prefixIcon: Icon(Icons.location_on_outlined, size: 20),
                              ),
                              items: _governorates
                                  .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _selectedGovernorate = val);
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
                              onSuffixTap: () => setState(() => _obscurePassword = !_obscurePassword),
                              validator: (v) =>
                                  v != null && v.length >= 6 ? null : 'يجب ألا تقل عن 6 أحرف',
                            ),
                            const SizedBox(height: AppSpacing.md),

                            // Medical Consent Checkbox
                            Container(
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceVariant.withValues(alpha: 0.6),
                                borderRadius: AppRadii.md,
                                border: Border.all(color: AppColors.border),
                              ),
                              child: CheckboxListTile(
                                value: _hasAgreedConsent,
                                onChanged: (val) => setState(() => _hasAgreedConsent = val ?? false),
                                contentPadding: EdgeInsets.zero,
                                controlAffinity: ListTileControlAffinity.leading,
                                activeColor: AppColors.primary,
                                title: const Text(
                                  'أوافق على الشروط الطبية وإقرار التبرع/الاستخدام لمنصة LifeLink',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    height: 1.35,
                                    fontFamily: 'Cairo',
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: AppSpacing.lg),

                            BlocBuilder<AuthBloc, AuthState>(
                              builder: (context, state) {
                                return LifeLinkButton(
                                  label: 'إنشاء الحساب والمتابعة',
                                  onPressed: _onRegister,
                                  isLoading: state is AuthLoading,
                                  icon: Icons.person_add_rounded,
                                );
                              },
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: AppSpacing.md),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'لديك حساب بالفعل؟',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          TextButton(
                            onPressed: () => context.pop(),
                            child: const Text(
                              'تسجيل الدخول',
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
