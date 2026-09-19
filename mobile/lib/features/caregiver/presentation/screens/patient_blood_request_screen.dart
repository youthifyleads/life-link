import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../domain/models/caregiver_models.dart';

class PatientBloodRequestScreen extends StatelessWidget {
  final PatientModel patient;

  const PatientBloodRequestScreen({super.key, required this.patient});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('بيانات المريض: ${patient.fullName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Patient Card
            Card(
              elevation: 0,
              shape: const RoundedRectangleBorder(
                borderRadius: AppRadii.lg,
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              patient.bloodType,
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                patient.fullName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: AppColors.navy,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'الفصيلة المسجلة: ${patient.bloodType}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (patient.notes != null && patient.notes!.isNotEmpty) ...[
                      const Divider(height: 28),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.notes_rounded, size: 18, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              patient.notes!,
                              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Guidance & Medical Rule Box
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.secondaryBlueLight,
                borderRadius: AppRadii.lg,
                border: Border.all(color: AppColors.secondaryBlue.withValues(alpha: 0.25)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.verified_user_rounded, color: AppColors.secondaryBlue, size: 24),
                      SizedBox(width: 10),
                      Text(
                        'إجراءات طلب أكياس الدم',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.secondaryBlue,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text(
                    'حفاظاً على سلامة المريض وسلسلة التبريد المعتمدة:\n\n'
                    '1. يقوم طبيب المستشفى المعالج بإصدار طلب كيس الدم رسمياً عبر منظومة LifeLink.\n'
                    '2. بعد تأكيد الطلب، اطلب من المستشفى رمز الاستجابة السريع (QR Code) أو رقم التتبع للطلب.\n'
                    '3. امسح كود طلب المستشفى عبر الزر أدناه لمراجعة الفاتورة، السداد الإلكتروني، ومتابعة وصول المندوب حتى باب المستشفى.',
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.6,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),

            // Action Button to scan hospital QR
            ElevatedButton.icon(
              onPressed: () => context.push('/qr/scan'),
              icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 24),
              label: const Text(
                'مسح كود طلب المستشفى',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.md,
                ),
                elevation: 2,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            OutlinedButton.icon(
              onPressed: () => context.push('/tracking'),
              icon: const Icon(Icons.search_rounded, color: AppColors.secondaryBlue),
              label: const Text(
                'إدخال رقم التتبع يدوياً',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.secondaryBlue),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: AppColors.secondaryBlue),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.md,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
