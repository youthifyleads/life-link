import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/api_error_message.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/lifelink_components.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../blood_requests/data/blood_request_remote_datasource.dart';
import '../../../blood_requests/domain/models/blood_request_model.dart';
import '../../domain/models/payment_model.dart';
import '../../data/payment_repository.dart';
import '../bloc/payment_history_cubit.dart';

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
  bool _loading = true;
  bool _loadingPayments = false;
  String? _error;
  List<BloodRequestPublic> _requests = [];
  List<PaymentModel> _payments = [];
  String? _selectedRequestId;

  @override
  void initState() {
    super.initState();
    _historyCubit = PaymentHistoryCubit(getIt<PaymentRepository>());
    if (widget.request == null && widget.requestId == null) {
      _error =
          'Caregiver payment history is unavailable in the current Azure API contract.';
      _loading = false;
    } else {
      _loadRequests();
    }
  }

  @override
  void dispose() {
    _historyCubit.close();
    super.dispose();
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
        _error = friendlyErrorMessage(error);
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

    await _historyCubit.load(requestId);
  }

  String? _paymentError;
  late final PaymentHistoryCubit _historyCubit;

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return '—';
    return DateFormat('MMM d, y • h:mm a').format(dateTime.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _historyCubit,
      child: BlocListener<PaymentHistoryCubit, PaymentHistoryState>(
        listener: (context, state) {
          if (!mounted) return;
          setState(() {
            _loadingPayments = state.loading;
            _paymentError = state.error;
            if (state.error == null && !state.loading) {
              _payments = state.payments;
            }
          });
        },
        child: Scaffold(
          appBar: AppBar(
            title: const Text('سجل المدفوعات والفواتير'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          body: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const LifeLinkLoadingState(message: 'جاري تحميل سجل المدفوعات...');
    }

    if (_error != null) {
      return LifeLinkStatePanel(
        icon: Icons.cloud_off_rounded,
        title: 'تعذر عرض سجل المدفوعات',
        message: _error!,
        actionLabel: 'إعادة المحاولة',
        onAction: _loadRequests,
        tone: AppColors.error,
      );
    }

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_requests.isNotEmpty) ...[
            const Text(
              'اختر طلب الدم المطلوب',
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
                      label: Text(
                          '${request.bloodType} • ${request.quantityUnits} وحدات'),
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
              child: Text(_paymentError!,
                  style: const TextStyle(color: AppColors.error)),
            )
          else if (_payments.isEmpty)
            Expanded(
              child: LifeLinkEmptyState(
                icon: Icons.payments_outlined,
                title: 'لا توجد فواتير أو مدفوعات',
                message: _requests.isEmpty
                    ? 'لم يتم تسجيل أي معاملات سداد حتى الآن.'
                    : _selectedRequestId == null
                        ? 'اختر طلب دم من القائمة أعلاه لعرض مدفوعاته.'
                        : 'لا توجد فواتير مسجلة لهذا الطلب حتى الآن.',
              ),
            )
          else
            Expanded(
              child: ListView.separated(
                itemCount: _payments.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final payment = _payments[index];
                  final methodLabel = payment.paymentMethod == 'card'
                      ? 'بطاقة بنكية'
                      : payment.paymentMethod == 'wallet'
                          ? 'محفظة إلكترونية / InstaPay'
                          : payment.paymentMethod == 'hospital_cash'
                              ? 'سداد بنكي/نقدي بالمستشفى'
                              : (payment.paymentMethod.isEmpty ? '—' : payment.paymentMethod);
                  return LifeLinkCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${payment.amount} ج.م',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            LifeLinkStatusChip(payment.paymentStatus),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _detailsRow('طريقة الدفع', methodLabel),
                        _detailsRow(
                            'Method',
                            payment.paymentMethod.isEmpty
                                ? '—'
                                : payment.paymentMethod),
                        _detailsRow(
                            'Reference', payment.transactionReference ?? '—'),
                        _detailsRow('Created', _formatDate(payment.createdAt)),
                        _detailsRow('Paid', _formatDate(payment.paidAt)),
                            'رقم المعاملة', payment.transactionReference ?? '—'),
                        if (payment.patientId != null)
                          _detailsRow('كود المريض', payment.patientId!),
                        if (payment.allocationId != null)
                          _detailsRow('كود التخصيص', payment.allocationId!),
                        if (payment.bloodBagId != null)
                          _detailsRow('كود كيس الدم', payment.bloodBagId!),
                        _detailsRow('تاريخ الإنشاء', _formatDate(payment.createdAt)),
                        _detailsRow('تاريخ السداد', _formatDate(payment.paidAt)),
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
            child: Text(label,
                style: const TextStyle(color: AppColors.textSecondary)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
