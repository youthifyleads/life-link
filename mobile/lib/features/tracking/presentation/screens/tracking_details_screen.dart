import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../domain/models/tracking_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/widgets/lifelink_components.dart';

class TrackingDetailsScreen extends StatelessWidget {
  final TrackingPublic tracking;
  const TrackingDetailsScreen({super.key, required this.tracking});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blood Bag Status'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status hero card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    _statusColor().withValues(alpha: 0.15),
                    _statusColor().withValues(alpha: 0.05)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border:
                    Border.all(color: _statusColor().withValues(alpha: 0.4)),
              ),
              child: Column(
                children: [
                  Icon(_statusIcon(), size: 64, color: _statusColor()),
                  const SizedBox(height: 12),
                  Text(
                    _statusLabel(),
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: _statusColor(),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _statusDescription(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            Text('Bag Details', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),

            _buildInfoCard([
              _infoRow(
                  context, Icons.water_drop, 'Blood Type', tracking.bloodType),
              _infoRow(context, Icons.science, 'Component',
                  _componentLabel(tracking.component)),
              _infoRow(context, Icons.qr_code, 'Reference', tracking.reference,
                  monospace: true),
              _infoRow(
                  context,
                  Icons.schedule,
                  'Last Updated',
                  DateFormat('MMM d, y • h:mm a')
                      .format(tracking.lastUpdated.toLocal())),
            ]),

            const SizedBox(height: 32),

            // Status Timeline
            Text('Status Timeline',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            LifeLinkTimeline(
              children: [
                _timelineEntry(
                  context,
                  tracking.status,
                  'This is the latest status returned by the tracking API.',
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Scan another button
            LifeLinkButton(
              label: 'Scan Another QR',
              icon: Icons.qr_code_scanner,
              isOutlined: true,
              onPressed: () => context.pop(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> rows) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: rows,
      ),
    );
  }

  Widget _infoRow(
      BuildContext context, IconData icon, String label, String value,
      {bool monospace = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.textHint)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontFamily: monospace ? 'monospace' : null,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _timelineEntry(
    BuildContext context,
    String status,
    String explanation,
  ) {
    return LifeLinkCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.radio_button_checked_rounded,
              color: AppColors.primary),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LifeLinkStatusChip(status),
                const SizedBox(height: AppSpacing.xs),
                Text(explanation,
                    style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _statusColor() {
    switch (tracking.status) {
      case 'completed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      case 'expired':
        return AppColors.textHint;
      case 'prepared':
        return AppColors.info;
      default:
        return AppColors.warning;
    }
  }

  IconData _statusIcon() {
    switch (tracking.status) {
      case 'completed':
        return Icons.check_circle_rounded;
      case 'cancelled':
        return Icons.cancel_rounded;
      case 'expired':
        return Icons.timer_off_rounded;
      case 'prepared':
        return Icons.inventory_2_rounded;
      case 'confirmed':
        return Icons.thumb_up_rounded;
      default:
        return Icons.pending_actions_rounded;
    }
  }

  String _statusLabel() {
    switch (tracking.status) {
      case 'requested':
        return 'Request Submitted';
      case 'acknowledged':
        return 'Acknowledged';
      case 'confirmed':
        return 'Confirmed';
      case 'prepared':
        return 'Blood Bag Ready';
      case 'completed':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return tracking.status;
    }
  }

  String _statusDescription() {
    switch (tracking.status) {
      case 'requested':
        return 'Your request has been submitted and is waiting for review.';
      case 'acknowledged':
        return 'The blood bank has acknowledged the request.';
      case 'confirmed':
        return 'A matching blood bag has been confirmed.';
      case 'prepared':
        return 'The blood bag is prepared and ready for pickup.';
      case 'completed':
        return 'The blood has been successfully delivered.';
      case 'cancelled':
        return 'This request has been cancelled.';
      case 'expired':
        return 'This request has expired.';
      default:
        return 'Latest status returned by the tracking service.';
    }
  }

  String _componentLabel(String component) {
    switch (component) {
      case 'whole_blood':
        return 'Whole Blood';
      case 'plasma':
        return 'Plasma';
      case 'platelets':
        return 'Platelets';
      case 'red_cells':
        return 'Red Blood Cells';
      default:
        return component;
    }
  }
}
