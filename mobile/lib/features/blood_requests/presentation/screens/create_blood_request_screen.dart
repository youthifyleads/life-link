import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/blood_request_bloc.dart';
import '../../domain/models/blood_request_model.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_text_field.dart';
import '../../../../core/theme/app_colors.dart';

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
      appBar: AppBar(
        title: const Text('New Blood Request'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
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
                  'Medical Details',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),

                // Blood Type Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _bloodType,
                  decoration: InputDecoration(
                    labelText: 'Blood Type',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  items: _bloodTypes
                      .map((type) => DropdownMenuItem(
                            value: type,
                            child: Text(type),
                          ))
                      .toList(),
                  onChanged: (val) => setState(() => _bloodType = val!),
                ),
                const SizedBox(height: 16),

                // Component Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _component,
                  decoration: InputDecoration(
                    labelText: 'Blood Component',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
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
                  label: 'Quantity (Units)',
                  keyboardType: TextInputType.number,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Required';
                    if (int.tryParse(v) == null || int.parse(v) <= 0) {
                      return 'Invalid amount';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Urgency Checkbox
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.3)),
                  ),
                  child: CheckboxListTile(
                    value: _isUrgent,
                    onChanged: (val) =>
                        setState(() => _isUrgent = val ?? false),
                    title: const Text(
                      'Urgent Request',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDark),
                    ),
                    subtitle: const Text('Check this if it is an emergency'),
                    activeColor: AppColors.primary,
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  'Additional Information',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),

                LifeLinkTextField(
                  controller: _reasonCtrl,
                  label: 'Medical Reason (Optional)',
                  hint: 'e.g., Surgery, Accident',
                ),
                const SizedBox(height: 16),
                LifeLinkTextField(
                  controller: _notesCtrl,
                  label: 'Notes (Optional)',
                  hint: 'Any specific instructions...',
                ),

                const SizedBox(height: 32),

                BlocBuilder<BloodRequestBloc, BloodRequestState>(
                  builder: (context, state) {
                    return LifeLinkButton(
                      label: 'Create Request',
                      onPressed: _submit,
                      isLoading: state is BloodRequestCreating,
                      icon: Icons.add_circle_outline,
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
