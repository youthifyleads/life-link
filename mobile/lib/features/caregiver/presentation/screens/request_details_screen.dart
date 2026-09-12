import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../../documents/presentation/bloc/document_bloc.dart';
import '../../../documents/domain/models/document_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_button.dart';

class RequestDetailsScreen extends StatefulWidget {
  final BloodRequestPublic request;
  const RequestDetailsScreen({super.key, required this.request});

  @override
  State<RequestDetailsScreen> createState() => _RequestDetailsScreenState();
}

class _RequestDetailsScreenState extends State<RequestDetailsScreen> {
  @override
  void initState() {
    super.initState();
    // Load documents for this specific request
    context.read<DocumentBloc>().add(LoadDocumentsEvent(widget.request.id));
  }

  Future<void> _pickAndUploadDocument() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'png', 'pdf'],
    );

    if (result != null && result.files.single.path != null) {
      final file = result.files.single;
      if (!mounted) return;
      context.read<DocumentBloc>().add(
            UploadDocumentEvent(widget.request.id, file.path!, file.name),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocListener<DocumentBloc, DocumentState>(
        listener: (context, state) {
          if (state is DocumentError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(state.message),
                  backgroundColor: AppColors.error),
            );
          } else if (state is DocumentUploadSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Document uploaded successfully'),
                  backgroundColor: AppColors.success),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRequestSummaryCard(),
              const SizedBox(height: 20),
              _buildAvailabilityStatusBanner(),
              const SizedBox(height: 28),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  '/caregiver/matches?requestId=${Uri.encodeComponent(widget.request.id)}',
                ),
                icon: const Icon(Icons.people_alt_outlined),
                label: const Text('View matching donors'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  '/caregiver/payment-history',
                  extra: widget.request,
                ),
                icon: const Icon(Icons.receipt_long_rounded),
                label: const Text('View payment history'),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Supporting Documents',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TextButton.icon(
                    onPressed: _pickAndUploadDocument,
                    icon: const Icon(Icons.upload_file),
                    label: const Text('Upload'),
                  )
                ],
              ),
              const SizedBox(height: 16),
              _buildDocumentsList(),
              const SizedBox(height: 32),
              if (widget.request.status == 'confirmed' ||
                  widget.request.status == 'prepared')
                LifeLinkButton(
                  label: 'Proceed to Payment & Checkout',
                  icon: Icons.payment_rounded,
                  onPressed: () =>
                      context.push('/caregiver/payment', extra: widget.request),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRequestSummaryCard() {
    final req = widget.request;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor:
                        req.urgency ? AppColors.error : AppColors.primary,
                    child: Text(req.bloodType,
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${req.quantityUnits} Units • ${req.component}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        req.status.toUpperCase(),
                        style: TextStyle(
                          color: req.status == 'requested'
                              ? AppColors.warning
                              : AppColors.success,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const Divider(height: 32),
          _detailRow('Tracking Ref', req.trackingReference),
          if (req.reason != null) _detailRow('Reason', req.reason!),
          if (req.notes != null) _detailRow('Notes', req.notes!),
          _detailRow('Created',
              DateFormat('MMM d, y h:mm a').format(req.createdAt.toLocal())),
        ],
      ),
    );
  }

  Widget _buildAvailabilityStatusBanner() {
    final req = widget.request;
    final bool isWaiting = req.status == 'requested';

    if (isWaiting) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.warning.withValues(alpha: 0.09),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.hourglass_top_rounded,
                    color: AppColors.warning, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'غير متاح بالمخزون حالياً • قيد المتابعة والانتظار',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.amber.shade900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'لا يتوفر رصيد فوري من فصيلة (${req.bloodType}) في بنك الدم، أو أن المتبرعين المسجلين لم يتجاوزوا فترة الأمان الطبية الإلزامية (6 أشهر / 180 يوماً منذ آخر تبرع).',
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border:
                    Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.notifications_active_outlined,
                      color: AppColors.primary, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'طلبك نشط في قائمة الانتظار. ستصلك رسالة وإشعار فوري بمجرد تأكيد متبرع مؤهل أو توفر رصيد جديد.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // When status is confirmed or prepared
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_rounded,
              color: AppColors.success, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'تم تأكيد توفير كيس الدم بنجاح!',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'تم تخصيص كيس دم مطابق (${req.bloodType}) أو تطابق متبرع معتمد. يُرجى التوجه للدفع أو الاستلام عبر كود التتبع.',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style:
                    const TextStyle(color: AppColors.textHint, fontSize: 13)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    color: AppColors.textPrimary, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentsList() {
    return BlocBuilder<DocumentBloc, DocumentState>(
      builder: (context, state) {
        bool isUploading = false;
        List<DocumentPublic> docs = [];

        if (state is DocumentLoading) {
          return const Center(child: CircularProgressIndicator());
        } else if (state is DocumentLoaded) {
          docs = state.documents;
        } else if (state is DocumentUploading) {
          docs = state.existingDocuments;
          isUploading = true;
        }

        if (docs.isEmpty && !isUploading) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border:
                  Border.all(color: AppColors.border, style: BorderStyle.none),
            ),
            child: const Column(
              children: [
                Icon(Icons.description_outlined,
                    color: AppColors.textHint, size: 48),
                SizedBox(height: 12),
                Text('No documents uploaded yet',
                    style: TextStyle(color: AppColors.textSecondary)),
                Text('Upload prescription or ID to verify request',
                    style: TextStyle(fontSize: 12, color: AppColors.textHint)),
              ],
            ),
          );
        }

        return Column(
          children: [
            ...docs.map((doc) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.picture_as_pdf,
                        color: AppColors.primary),
                    title: Text(doc.fileName,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text('Status: ${doc.status}'),
                    trailing: doc.status == 'approved'
                        ? const Icon(Icons.check_circle,
                            color: AppColors.success)
                        : doc.status == 'rejected'
                            ? const Icon(Icons.cancel, color: AppColors.error)
                            : const Icon(Icons.pending_actions,
                                color: AppColors.warning),
                  ),
                )),
            if (isUploading)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Center(child: CircularProgressIndicator()),
              )
          ],
        );
      },
    );
  }
}
