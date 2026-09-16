import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../../domain/models/user_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
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
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;

    if (!_hasAgreedConsent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('يجب الموافقة على إقرار وتعهد المتبرع والشروط للمتابعة'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    context.read<AuthBloc>().add(
          AuthRegisterEvent(
            fullName: _nameCtrl.text.trim(),
            phone: _phoneCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
            role: _selectedRole,
            bloodType:
                _selectedRole == UserRole.donor ? _selectedBloodType : null,
            governorate: _selectedGovernorate,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthOtpRequiredState) {
          context.push('/otp', extra: {
            'email': state.email,
            'phone': state.phone,
            'isRegistration': true,
            'challengeId': state.challengeId,
          });
        }
        if (state is AuthAuthenticated) {
          final role = state.user.role;
          if (role.isDonor) {
            context.go('/donor/home');
          } else if (role.isCaregiver) {
            context.go('/caregiver/home');
          } else {
            context.go('/home');
          }
        }
        if (state is AuthRegistrationSucceeded) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.'),
            ),
          );
          context.go('/login');
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
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_rounded),
            onPressed: () => context.pop(),
            color: AppColors.textPrimary,
          ),
          title: const Text(
            'إنشاء حساب جديد / Register',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: SingleChildScrollView(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'انضم إلى شبكة LifeLink',
                        style:
                            Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'سجل بياناتك لإرسال رمز التحقق OTP وتفعيل الحساب',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                      const SizedBox(height: 24),

                      // Role Selector (Donor / Caregiver)
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: ChoiceChip(
                                label: const Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.favorite,
                                          size: 16, color: Colors.red),
                                      SizedBox(width: 6),
                                      Text('متبرع (Donor)',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                                selected: _selectedRole == UserRole.donor,
                                onSelected: (sel) {
                                  if (sel) {
                                    setState(
                                        () => _selectedRole = UserRole.donor);
                                  }
                                },
                                selectedColor: AppColors.primaryLight,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ChoiceChip(
                                label: const Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.local_hospital,
                                          size: 16, color: Colors.blue),
                                      SizedBox(width: 6),
                                      Text('مرافق مريض (Caregiver)',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                                selected: _selectedRole == UserRole.caregiver,
                                onSelected: (sel) {
                                  if (sel) {
                                    setState(() =>
                                        _selectedRole = UserRole.caregiver);
                                  }
                                },
                                selectedColor: Colors.blue.shade50,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      LifeLinkTextField(
                        controller: _nameCtrl,
                        label: 'الاسم الكامل (Full Name)',
                        hint: 'أحمد محمود',
                        prefixIcon: Icons.person_outline,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'يرجى إدخال الاسم';
                          }
                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      LifeLinkTextField(
                        controller: _phoneCtrl,
                        label: 'رقم الهاتف (Phone Number)',
                        hint: '01012345678',
                        keyboardType: TextInputType.phone,
                        prefixIcon: Icons.phone_outlined,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'يرجى إدخال رقم الهاتف لإرسال OTP';
                          }
                          if (v.trim().length < 10) return 'رقم هاتف غير صالح';
                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      LifeLinkTextField(
                        controller: _emailCtrl,
                        label: 'البريد الإلكتروني (Email Address)',
                        hint: 'you@example.com',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icons.email_outlined,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'يرجى إدخال البريد الإلكتروني';
                          }
                          if (!v.contains('@')) return 'بريد إلكتروني غير صالح';
                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      LifeLinkTextField(
                        controller: _passwordCtrl,
                        label: 'كلمة المرور (Password)',
                        hint: '••••••••',
                        obscureText: _obscurePassword,
                        prefixIcon: Icons.lock_outline,
                        suffixIcon: _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        onSuffixTap: () => setState(
                            () => _obscurePassword = !_obscurePassword),
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

                      const SizedBox(height: 16),

                      // Governorate Dropdown
                      DropdownButtonFormField<String>(
                        initialValue: _selectedGovernorate,
                        decoration: InputDecoration(
                          labelText: 'المحافظة (Governorate)',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                          prefixIcon: const Icon(Icons.location_on_outlined),
                        ),
                        items: _governorates
                            .map((gov) =>
                                DropdownMenuItem(value: gov, child: Text(gov)))
                            .toList(),
                        onChanged: (val) =>
                            setState(() => _selectedGovernorate = val!),
                      ),

                      if (_selectedRole == UserRole.donor) ...[
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedBloodType,
                          decoration: InputDecoration(
                            labelText: 'فصيلة الدم (Blood Type)',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            prefixIcon: const Icon(Icons.bloodtype_outlined,
                                color: Colors.red),
                          ),
                          items: _bloodTypes
                              .map((type) => DropdownMenuItem(
                                  value: type, child: Text(type)))
                              .toList(),
                          onChanged: (val) =>
                              setState(() => _selectedBloodType = val!),
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Donor Consent & Disclaimer Checkbox
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _hasAgreedConsent
                                ? AppColors.primary
                                : AppColors.border,
                          ),
                        ),
                        child: CheckboxListTile(
                          value: _hasAgreedConsent,
                          onChanged: (val) =>
                              setState(() => _hasAgreedConsent = val ?? false),
                          activeColor: AppColors.primary,
                          dense: true,
                          title: const Text(
                            'إقرار وتعهد المتبرع الإلزامي (Donor Consent)',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          subtitle: const Text(
                            'أقر باللياقة الطبية والصحة العامة والإفصاح عن السجل الصحي، والموافقة على شروط الاستخدام وسياسة الخصوصية لمنظومة LifeLink.',
                            style: TextStyle(
                                fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          return LifeLinkButton(
                            label: 'إرسال رمز التحقق (Send OTP)',
                            onPressed: _onRegister,
                            isLoading: state is AuthLoading,
                            icon: Icons.send_rounded,
                          );
                        },
                      ),

                      const SizedBox(height: 16),

                      Center(
                        child: TextButton(
                          onPressed: () => context.pop(),
                          child: const Text('لديك حساب بالفعل؟ تسجيل الدخول'),
                        ),
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
