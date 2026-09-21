import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../../core/widgets/lifelink_text_field.dart';
import '../../../../core/network/api_error_message.dart';
import 'package:go_router/go_router.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class CaregiverPatientsScreen extends StatefulWidget {
  const CaregiverPatientsScreen({super.key});

  @override
  State<CaregiverPatientsScreen> createState() =>
      _CaregiverPatientsScreenState();
}

class _CaregiverPatientsScreenState extends State<CaregiverPatientsScreen> {
  late Future<List<PatientModel>> _patients;

  @override
  void initState() {
    super.initState();
    _patients = getIt<CaregiverRemoteDataSource>().getPatients();
  }

  void _reload() {
    setState(() {
      _patients = getIt<CaregiverRemoteDataSource>().getPatients();
    });
  }

  Future<void> _addPatient() async {
    final name = TextEditingController();
    String selectedBloodType = 'A+';
    final hospitalId = TextEditingController();
    final notes = TextEditingController();
    final formKey = GlobalKey<FormState>();
    final created = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
          contentPadding: const EdgeInsets.symmetric(horizontal: 24),
          actionsPadding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
          title: const Text(
            'إضافة مريض جديد',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              fontFamily: 'Cairo',
              color: AppColors.textPrimary,
            ),
          ),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  LifeLinkTextField(
                    controller: name,
                    label: 'اسم المريض بالكامل',
                    hint: 'مثال: كريم سعيد',
                    prefixIcon: Icons.person_outline_rounded,
                    validator: (value) =>
                        value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    initialValue: selectedBloodType,
                    decoration: InputDecoration(
                      labelText: 'فصيلة الدم المطلوبة',
                      labelStyle: const TextStyle(
                        fontFamily: 'Cairo',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                      prefixIcon: const Icon(Icons.water_drop_rounded, color: AppColors.primary),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    style: const TextStyle(
                      fontFamily: 'Cairo',
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                    dropdownColor: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
                    items: const [
                      DropdownMenuItem(value: 'A+', child: Text('A+  (موجب)')),
                      DropdownMenuItem(value: 'A-', child: Text('A-  (سالب)')),
                      DropdownMenuItem(value: 'B+', child: Text('B+  (موجب)')),
                      DropdownMenuItem(value: 'B-', child: Text('B-  (سالب)')),
                      DropdownMenuItem(value: 'AB+', child: Text('AB+ (موجب)')),
                      DropdownMenuItem(value: 'AB-', child: Text('AB- (سالب)')),
                      DropdownMenuItem(value: 'O+', child: Text('O+  (موجب)')),
                      DropdownMenuItem(value: 'O-', child: Text('O-  (سالب)')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() => selectedBloodType = val);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  LifeLinkTextField(
                    controller: hospitalId,
                    label: 'كود المستشفى أو رقم الملف الطبي',
                    hint: 'مثال: #HOSP-104',
                    helperText: 'مطلوب لربط الحالة والطلبات بالمركز الطبي',
                    prefixIcon: Icons.local_hospital_outlined,
                    validator: (value) =>
                        value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null,
                  ),
                  const SizedBox(height: 16),
                  LifeLinkTextField(
                    controller: notes,
                    label: 'ملاحظات طبية (اختياري)',
                    hint: 'أي توصيات أو تاريخ مرضي خاص',
                    prefixIcon: Icons.description_outlined,
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
                    onPressed: () => Navigator.pop(dialogContext, false),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppColors.border),
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
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) return;
                      try {
                        await getIt<CaregiverRemoteDataSource>().createPatient(
                          fullName: name.text.trim(),
                          bloodType: selectedBloodType,
                          hospitalId: hospitalId.text.trim(),
                          notes: notes.text.trim(),
                        );
                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext, true);
                        }
                      } catch (error) {
                        if (dialogContext.mounted) {
                          ScaffoldMessenger.of(dialogContext).showSnackBar(
                            SnackBar(
                              content: Text(friendlyErrorMessage(error)),
                              backgroundColor: AppColors.error,
                            ),
                          );
                        }
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
                    child: const Text(
                      'حفظ المريض',
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
        ),
      ),
    );
    name.dispose();
    hospitalId.dispose();
    notes.dispose();
    if (created == true && mounted) _reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('سجل المرضى التابعين')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addPatient,
        icon: const Icon(Icons.person_add_alt_1),
        label: const Text('إضافة مريض'),
      ),
      body: FutureBuilder<List<PatientModel>>(
        future: _patients,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LifeLinkLoadingState(message: 'جاري تحميل سجل المرضى...');
          }
          if (snapshot.hasError) {
            return LifeLinkStatePanel(
              icon: Icons.cloud_off_rounded,
              title: 'تعذر تحميل بيانات المرضى',
              message:
                  'يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.',
              actionLabel: 'إعادة المحاولة',
              onAction: _reload,
            );
          }
          final patients = snapshot.data ?? const <PatientModel>[];
          if (patients.isEmpty) {
            return LifeLinkStatePanel(
              icon: Icons.people_outline_rounded,
              title: 'لا يوجد مرضى مسجلون بعد',
              message:
                  'أضف بيانات المرضى التابعين لك لتتمكن من متابعة أكياس الدم ومسح كود طلب المستشفى.',
              actionLabel: 'إضافة مريض الآن',
              onAction: _addPatient,
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: patients.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final patient = patients[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.primaryLight,
                      child: Text(
                        patient.bloodType,
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                    title: Text(patient.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(patient.notes ?? 'لا توجد ملاحظات إضافية'),
                    trailing: IconButton(
                      tooltip: 'مسح كود طلب المستشفى للمريض',
                      icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
                      onPressed: () => context.push('/qr/scan'),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
