import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/blood_request_bloc.dart';
import '../../domain/models/blood_request_model.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_text_field.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';

class CreateBloodRequestScreen extends StatefulWidget {
  const CreateBloodRequestScreen({super.key});

  @override
  State<CreateBloodRequestScreen> createState() =>
      _CreateBloodRequestScreenState();
}

class _CreateBloodRequestScreenState extends State<CreateBloodRequestScreen> {
  final _formKey = GlobalKey<FormState>();

  String _bloodType = 'A+';
  String _component = 'whole_blood';
  bool _isUrgent = false;

  final _quantityCtrl = TextEditingController(text: '1');
  final _reasonCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

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
  final Map<String, String> _components = {
    'whole_blood': 'Whole Blood',
    'plasma': 'Plasma',
    'platelets': 'Platelets',
    'red_cells': 'Red Cells',
  };

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final int qty = int.tryParse(_quantityCtrl.text) ?? 1;

    final requestData = BloodRequestCreate(
      bloodType: _bloodType,
      component: _component,
      quantityUnits: qty,
      urgency: _isUrgent,
      reason: _reasonCtrl.text.isNotEmpty ? _reasonCtrl.text : null,
      notes: _notesCtrl.text.isNotEmpty ? _notesCtrl.text : null,
    );

    context.read<BloodRequestBloc>().add(CreateRequestEvent(requestData));
  }

  @override
  void dispose() {
    _quantityCtrl.dispose();
    _reasonCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const LifeLinkDetailAppBar(
        title: 'طلب دم جديد',
      ),
      body: BlocListener<BloodRequestBloc, BloodRequestState>(
        listener: (context, state) {
          if (state is BloodRequestCreateSuccess) {
            showDialog(
              context: context,
              barrierDismissible: false,
              builder: (ctx) => AlertDialog(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                title: const Row(
                  children: [
                    Icon(Icons.check_circle_rounded, color: AppColors.success),
                    SizedBox(width: 8),
                    Text('تم إرسال الطلب بنجاح'),
                  ],
                ),
                content: Text(
                  'تم تسجيل طلبك (${state.newRequest.trackingReference}) بنجاح.\n\nإذا لم تتوفر الفصيلة فوراً في المخزون أو لم يتواجد متبرع أكمل 6 أشهر، يظل طلبك قيد المتابعة والبحث المستمر في قائمة الانتظار، وسيصلك إشعار فوري عند التوافر.',
                  style: const TextStyle(fontSize: 13, height: 1.4),
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      context.pop(true);
                    },
                    child: const Text('متابعة الطلبات',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary)),
                  ),
                ],
              ),
            );
          } else if (state is BloodRequestError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'البيانات الطبية المطلوبة',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),

                Text(
                  'فصيلة الدم المطلوبة',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.navy,
                      ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _bloodTypes.map((type) {
                    final isSelected = _bloodType == type;
                    return ChoiceChip(
                      label: Text(
                        type,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.navy,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      shape: const RoundedRectangleBorder(borderRadius: AppRadii.sm),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                      onSelected: (selected) {
                        if (selected) setState(() => _bloodType = type);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Component Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _component,
                  decoration: const InputDecoration(
                    labelText: 'مكون الدم المطلوب',
                    border: OutlineInputBorder(
                        borderRadius: AppRadii.md),
                  ),
                  items: _components.entries
                      .map((e) => DropdownMenuItem(
                            value: e.key,
                            child: Text(e.value),
                          ))
                      .toList(),
                  onChanged: (val) => setState(() => _component = val!),
                ),
                const SizedBox(height: 16),

                // Quantity
                LifeLinkTextField(
                  controller: _quantityCtrl,
                  label: 'الكمية المطلوبة (بالوحدات)',
                  keyboardType: TextInputType.number,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'هذا الحقل مطلوب';
                    if (int.tryParse(v) == null || int.parse(v) <= 0) {
                      return 'يرجى إدخال عدد وحدات صحيح';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Urgency Switch
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: _isUrgent ? AppColors.primaryLight : Colors.white,
                    borderRadius: AppRadii.md,
                    border: Border.all(
                      color: _isUrgent ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _isUrgent,
                    onChanged: (val) => setState(() => _isUrgent = val),
                    title: const Text(
                      'طلب طارئ وعاجل',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    subtitle: const Text(
                      'أولوية قصوى للحالات الحرجة',
                      style: TextStyle(fontSize: 12),
                    ),
                    activeThumbColor: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  'تفاصيل وملاحظات إضافية',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),

                LifeLinkTextField(
                  controller: _reasonCtrl,
                  label: 'السبب الطبي (اختياري)',
                  hint: 'مثال: عملية جراحية، نزيف طارئ',
                ),
                const SizedBox(height: 16),
                LifeLinkTextField(
                  controller: _notesCtrl,
                  label: 'ملاحظات وتوصيات إضافية (اختياري)',
                  hint: 'أي تفاصيل أو اشتراطات خاصة بالحالة...',
                ),

                const SizedBox(height: 32),

                BlocBuilder<BloodRequestBloc, BloodRequestState>(
                  builder: (context, state) {
                    return LifeLinkButton(
                      label: 'إرسال طلب الدم',
                      onPressed: _submit,
                      isLoading: state is BloodRequestCreating,
                      icon: Icons.send_rounded,
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
