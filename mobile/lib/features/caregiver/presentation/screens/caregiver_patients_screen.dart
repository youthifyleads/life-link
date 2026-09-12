import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
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
    final notes = TextEditingController();
    final formKey = GlobalKey<FormState>();
    final created = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Add patient'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: name,
                decoration: const InputDecoration(labelText: 'Full name'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'Required' : null,
              ),
              TextFormField(
                controller: bloodType,
                decoration: const InputDecoration(labelText: 'Blood type'),
                validator: (value) => value == null || value.trim().length < 2
                    ? 'Required'
                    : null,
              ),
              TextFormField(
                controller: notes,
                decoration: const InputDecoration(labelText: 'Notes'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              try {
                await getIt<CaregiverRemoteDataSource>().createPatient(
                  fullName: name.text.trim(),
                  bloodType: bloodType.text.trim().toUpperCase(),
                  notes: notes.text.trim(),
                );
                if (dialogContext.mounted) {
                  Navigator.pop(dialogContext, true);
                }
              } catch (error) {
                if (dialogContext.mounted) {
                  ScaffoldMessenger.of(dialogContext).showSnackBar(
                    SnackBar(content: Text(error.toString())),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    name.dispose();
    bloodType.dispose();
    notes.dispose();
    if (created == true && mounted) _reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Patients')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addPatient,
        icon: const Icon(Icons.person_add_alt_1),
        label: const Text('Add patient'),
      ),
      body: FutureBuilder<List<PatientModel>>(
        future: _patients,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: FilledButton.icon(
                onPressed: _reload,
                icon: const Icon(Icons.refresh),
                label: Text('Retry: ${snapshot.error}'),
              ),
            );
          }
          final patients = snapshot.data ?? const <PatientModel>[];
          if (patients.isEmpty) {
            return const Center(child: Text('No patients added yet.'));
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
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.primaryLight,
                      child: Text(patient.bloodType),
                    ),
                    title: Text(patient.fullName),
                    subtitle: Text(patient.notes ?? 'No notes'),
                    trailing: IconButton(
                      tooltip: 'Create blood request',
                      icon: const Icon(Icons.add_circle_outline),
                      onPressed: () async {
                        final created = await context.push<bool>(
                          '/caregiver/patients/request',
                          extra: patient,
                        );
                        if (created == true && mounted) _reload();
                      },
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
