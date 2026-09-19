import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_states.dart';
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
    final bloodType = TextEditingController();
    final hospitalId = TextEditingController();
    final notes = TextEditingController();
    final formKey = GlobalKey<FormState>();
    final created = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('إضافة مريض جديد'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: name,
                decoration: const InputDecoration(labelText: 'اسم المريض بالكامل'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null,
              ),
              TextFormField(
                controller: bloodType,
                decoration: const InputDecoration(
                  labelText: 'فصيلة الدم',
                  hintText: 'مثال: O+, A-, AB+',
                ),
                validator: (value) => value == null || value.trim().length < 2
                    ? 'يرجى إدخال فصيلة دم صحيحة'
                    : null,
              ),
              TextFormField(
                controller: hospitalId,
                decoration: const InputDecoration(
                  labelText: 'كود المستشفى أو رقم الملف الطبي',
                  helperText: 'مطلوب لربط الحالة والطلبات بالمركز الطبي',
                ),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null,
              ),
              TextFormField(
                controller: notes,
                decoration: const InputDecoration(labelText: 'ملاحظات طبية (اختياري)'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              try {
                await getIt<CaregiverRemoteDataSource>().createPatient(
                  fullName: name.text.trim(),
                  bloodType: bloodType.text.trim().toUpperCase(),
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
            child: const Text('حفظ المريض'),
          ),
        ],
      ),
    );
    name.dispose();
    bloodType.dispose();
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
