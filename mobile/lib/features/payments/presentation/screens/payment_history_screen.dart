import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../blood_requests/data/blood_request_remote_datasource.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../domain/models/payment_model.dart';

class PaymentHistoryScreen extends StatefulWidget {
  final BloodRequestPublic? request;
  final String? requestId;

  const PaymentHistoryScreen({
    super.key,
    this.request,
    this.requestId,
  });

  @override
  State<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends State<PaymentHistoryScreen> {
  final BloodRequestRemoteDataSource _requestDataSource =
      getIt<BloodRequestRemoteDataSource>();
  final Dio _dio = getIt<Dio>();

  bool _loading = true;
  bool _loadingPayments = false;
  String? _error;
  List<BloodRequestPublic> _requests = [];
  List<PaymentModel> _payments = [];
  String? _selectedRequestId;

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    try {
      final requests = await _requestDataSource.getRequests();
      final selected = widget.request?.id ??
          widget.requestId ??
          (requests.isNotEmpty ? requests.first.id : null);
      setState(() {
        _requests = requests;
        _selectedRequestId = selected;
        _loading = false;
      });
      if (selected != null) {
        await _loadPaymentsForRequest(selected);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadPaymentsForRequest(String requestId) async {
    if (!mounted) return;
    setState(() {
      _loadingPayments = true;
      _selectedRequestId = requestId;
      _error = null;
    });

    try {
      final response = await _dio.get(
        ApiEndpoints.paymentsByRequestId(requestId),
      );
      final data = response.data as List;
      final payments = data
          .map((json) => PaymentModel.fromJson(json as Map<String, dynamic>))
          .toList();
      if (!mounted) return;
      setState(() {
        _payments = payments;
        _loadingPayments = false;
      });
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() {
        _paymentError = apiErrorMessage(error);
        _loadingPayments = false;
      });
    }
  }

  String? _paymentError;

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return '—';
    return DateFormat('MMM d, y • h:mm a').format(dateTime.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment history'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error!),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_requests.isNotEmpty) ...[
            const Text(
              'Select request',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 52,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _requests.length,
                itemBuilder: (context, index) {
                  final request = _requests[index];
                  final selected = request.id == _selectedRequestId;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text('${request.bloodType} • ${request.quantityUnits}u'),
                      selected: selected,
                      onSelected: (_) => _loadPaymentsForRequest(request.id),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
          ],
          if (_loadingPayments)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_paymentError != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(_paymentError!, style: const TextStyle(color: AppColors.error)),
            )
          else if (_payments.isEmpty)
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    _selectedRequestId == null
                        ? 'Select a request to view payment history.'
                        : 'No payment records exist yet for this request.',
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            )
          else
            Expanded(
              child: ListView.separated(
                itemCount: _payments.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final payment = _payments[index];
                  final isSuccessful = payment.isSuccessful;
                  final isFailure = payment.isFailed;
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
                                'EGP ${payment.amount}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            Chip(
                              label: Text(
                                payment.paymentStatus.toUpperCase(),
                                style: const TextStyle(fontSize: 11),
                              ),
                              backgroundColor: isSuccessful
                                  ? AppColors.success.withValues(alpha: 0.12)
                                  : isFailure
                                      ? AppColors.error.withValues(alpha: 0.12)
                                      : AppColors.warning.withValues(alpha: 0.12),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _detailsRow('Method', payment.paymentMethod.isEmpty ? '—' : payment.paymentMethod),
                        _detailsRow('Reference', payment.transactionReference ?? '—'),
                        _detailsRow('Created', _formatDate(payment.createdAt)),
                        _detailsRow('Paid', _formatDate(payment.paidAt)),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
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
            width: 92,
            child: Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
