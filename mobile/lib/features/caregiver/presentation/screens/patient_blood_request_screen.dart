import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class PatientBloodRequestScreen extends StatefulWidget {
  final PatientModel patient;

  const PatientBloodRequestScreen({super.key, required this.patient});

  @override
  State<PatientBloodRequestScreen> createState() =>
      _PatientBloodRequestScreenState();
}

class _PatientBloodRequestScreenState extends State<PatientBloodRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController(text: '1');
  final _reasonController = TextEditingController();
  final _notesController = TextEditingController();
  late String _component;
  bool _urgent = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _component = 'whole_blood';
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _reasonController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final request = BloodRequestCreate(
        bloodType: widget.patient.bloodType,
        component: _component,
        quantityUnits: int.parse(_quantityController.text),
        urgency: _urgent,
        reason: _reasonController.text.trim().isEmpty
            ? null
            : _reasonController.text.trim(),
        notes: _notesController.text.trim().isEmpty
            ? null
            : _notesController.text.trim(),
      );
      final created =
          await getIt<CaregiverRemoteDataSource>().createPatientBloodRequest(
        patientId: widget.patient.id,
        request: request,
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Request created'),
          content: Text(
            'Tracking reference: ${created.trackingReference}',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Done'),
            ),
          ],
        ),
      );
      if (mounted) context.pop(true);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Request for ${widget.patient.fullName}')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Blood type: ${widget.patient.bloodType}'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _component,
              decoration: const InputDecoration(labelText: 'Component'),
              items: const [
                DropdownMenuItem(
                    value: 'whole_blood', child: Text('Whole blood')),
                DropdownMenuItem(value: 'plasma', child: Text('Plasma')),
                DropdownMenuItem(value: 'platelets', child: Text('Platelets')),
                DropdownMenuItem(value: 'red_cells', child: Text('Red cells')),
              ],
              onChanged: (value) {
                if (value != null) setState(() => _component = value);
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _quantityController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity'),
              validator: (value) {
                final quantity = int.tryParse(value ?? '');
                return quantity == null || quantity <= 0
                    ? 'Enter a positive quantity'
                    : null;
              },
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Urgent request'),
              value: _urgent,
              onChanged: (value) => setState(() => _urgent = value),
            ),
            TextFormField(
              controller: _reasonController,
              decoration: const InputDecoration(labelText: 'Medical reason'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Notes'),
            ),
            const SizedBox(height: 24),
            LifeLinkButton(
              label: 'Create blood request',
              isLoading: _submitting,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
