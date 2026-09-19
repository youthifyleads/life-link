import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/features/donor/data/donor_remote_datasource.dart';
import 'package:lifelink_mobile/features/notifications/data/notification_remote_datasource.dart';
import 'package:lifelink_mobile/features/notifications/domain/models/notification_model.dart';

class _MockDio extends Mock implements Dio {}

void main() {
  test('voucher datasource parses the backend voucher fields', () async {
    final dio = _MockDio();
    when(() => dio.get('/donors/me/vouchers')).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/donors/me/vouchers'),
        data: [
          {
            'id': 'voucher-1',
            'code': 'DONATE-1',
            'donor_id': 'donor-1',
            'partner_id': 'partner-1',
            'value': 250,
            'status': 'issued',
            'issued_at': '2026-09-18T10:00:00Z',
            'expires_at': '2026-12-18T10:00:00Z',
            'redeemed_at': null,
            'transaction_reference': 'tx-1',
          },
        ],
      ),
    );

    final vouchers = await DonorRemoteDataSource(dio).getVouchers();

    expect(vouchers.single.id, 'voucher-1');
    expect(vouchers.single.donorId, 'donor-1');
    expect(vouchers.single.partnerId, 'partner-1');
    expect(vouchers.single.transactionReference, 'tx-1');
  });

  test('notification datasource sends the real notification ID when reading',
      () async {
    final dio = _MockDio();
    when(() => dio.post('/notifications/n-1/read')).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/notifications/n-1/read'),
        data: {
          'id': 'n-1',
          'user_id': 'user-1',
          'trigger': 'REQUEST_CREATED',
          'message': 'A request was created',
          'is_read': true,
          'created_at': '2026-09-18T10:00:00Z',
        },
      ),
    );

    final result =
        await NotificationRemoteDataSource(dio).markAsRead('n-1');

    expect(result.id, 'n-1');
    expect(result.isRead, isTrue);
    verify(() => dio.post('/notifications/n-1/read')).called(1);
  });

  test('notification model parses an empty-safe real backend payload', () {
    final notification = NotificationModel.fromJson(const {
      'id': 'n-1',
      'user_id': 'user-1',
      'trigger': 'REQUEST_CREATED',
      'message': 'A request was created',
      'is_read': false,
      'related_request_id': 'request-1',
      'created_at': '2026-09-18T10:00:00Z',
    });

    expect(notification.relatedRequestId, 'request-1');
    expect(notification.isRead, isFalse);
  });
}
