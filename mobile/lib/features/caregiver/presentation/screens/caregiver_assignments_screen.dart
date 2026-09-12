import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class CaregiverAssignmentsScreen extends StatefulWidget {
  const CaregiverAssignmentsScreen({super.key});

  @override
  State<CaregiverAssignmentsScreen> createState() =>
      _CaregiverAssignmentsScreenState();
}

class _CaregiverAssignmentsScreenState extends State<CaregiverAssignmentsScreen> {
  final CaregiverRemoteDataSource _dataSource = getIt<CaregiverRemoteDataSource>();

  bool _loading = true;
  String? _error;
  List<CaregiverAssignmentModel> _assignments = [];

  @override
  void initState() {
    super.initState();
    _loadAssignments();
  }

  Future<void> _loadAssignments() async {
    try {
      final assignments = await _dataSource.getAssignments();
      if (!mounted) return;
      setState(() {
        _assignments = assignments;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return 'Not provided';
    return DateFormat('MMM d, y • h:mm a').format(dateTime.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assignments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadAssignments,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_error!),
                  ),
                )
              : _assignments.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text(
                          'No caregiver assignments are available yet.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: _assignments.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final assignment = _assignments[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Bag ${assignment.bloodBagId}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  Chip(
                                    label: Text(assignment.status),
                                    backgroundColor: assignment.status == 'assigned'
                                        ? AppColors.primary.withValues(alpha: 0.12)
                                        : AppColors.success.withValues(alpha: 0.12),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              _detailsRow('Hospital', assignment.hospitalId),
                              _detailsRow('Caregiver', assignment.caregiverUserId),
                              _detailsRow('Assigned', _formatDate(assignment.assignmentDate)),
                              if (assignment.notes != null && assignment.notes!.isNotEmpty)
                                _detailsRow('Notes', assignment.notes!),
                            ],
                          ),
                        );
                      },
                    ),
    );
  }

  Widget _detailsRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 86,
            child: Text(
              label,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
