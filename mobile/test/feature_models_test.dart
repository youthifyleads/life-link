import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/core/network/api_error_message.dart';
import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_profile_model.dart';
import 'package:lifelink_mobile/features/payments/domain/models/payment_model.dart';
import 'package:lifelink_mobile/features/tracking/domain/models/tracking_model.dart';

class MockDio extends Mock implements Dio {}

class MockStorage extends Mock implements FlutterSecureStorage {}

void main() {
  test('maps donor profile availability and eligibility', () {
    final profile = DonorProfileModel.fromJson(const {
      'id': 'donor-1',
      'full_name': 'Donor One',
      'blood_type': 'A+',
      'available_to_donate': true,
      'is_eligible': true,
      'days_until_eligible': 0,
      'total_donations': 3,
    });

    expect(profile.availableToDonate, isTrue);
    expect(profile.isEligible, isTrue);
    expect(profile.totalDonations, 3);
  });

  test('maps donor donation history', () {
    final donation = DonationHistoryItem.fromJson(const {
      'id': 'donation-1',
      'hospital_name': 'Central Hospital',
      'donation_date': '2026-09-01T10:00:00Z',
      'blood_type': 'O+',
      'status': 'completed',
    });

    expect(donation.hospitalName, 'Central Hospital');
    expect(donation.status, 'completed');
  });

  test('maps request-level QR tracking response', () {
    final tracking = TrackingPublic.fromJson(const {
      'reference': 'track-1',
      'status': 'prepared',
      'blood_type': 'B+',
      'component': 'whole_blood',
      'last_updated': '2026-09-12T10:00:00Z',
    });

    expect(tracking.reference, 'track-1');
    expect(tracking.status, 'prepared');
    expect(tracking.component, 'whole_blood');
  });

  test('maps backend payment statuses without claiming pending success', () {
    final pending = PaymentModel.fromJson({
      'id': 'pay-1',
      'blood_request_id': 'request-1',
      'amount': '350.00',
      'payment_status': 'pending',
      'payment_method': 'card',
      'transaction_reference': 'request-1',
      'created_at': '2026-09-12T10:00:00Z',
    });
    final paid = PaymentModel.fromJson({
      'id': 'pay-2',
      'blood_request_id': 'request-1',
      'amount': '350.00',
      'payment_status': 'paid',
      'payment_method': 'card',
      'paid_at': '2026-09-12T10:08:00Z',
    });

    expect(pending.isSuccessful, isFalse);
    expect(paid.isSuccessful, isTrue);
    expect(pending.transactionReference, 'request-1');
    expect(pending.createdAt, isNotNull);
  });

  test('accepts Azure payment schema fields and request history array', () {
    final payment = PaymentModel.fromJson({
      'id': 'pay-azure-1',
      'amount': '250.00',
      'payment_status': 'completed',
      'payment_method': 'card',
      'blood_request_id': 'request-azure-1',
      'transaction_reference': 'txn-456',
      'created_at': '2026-09-12T09:00:00Z',
      'paid_at': '2026-09-12T09:05:00Z',
    });

    expect(payment.paymentId, 'pay-azure-1');
    expect(payment.isSuccessful, isTrue);
    expect(payment.paidAt, isNotNull);
    expect(payment.paymentMethod, 'card');
  });

  test('maps API error responses to user-safe messages', () {
    final error = DioException(
      requestOptions: RequestOptions(path: '/auth/login'),
      response: Response(
        requestOptions: RequestOptions(path: '/auth/login'),
        statusCode: 401,
        data: {
          'error': {'code': 'INVALID_CREDENTIALS'},
        },
      ),
    );

    expect(apiErrorMessage(error), contains('جلسة'));
  });

  test('auth datasource returns a typed failure for invalid credentials',
      () async {
    final dio = MockDio();
    when(() => dio.post('/auth/login', data: any(named: 'data'))).thenThrow(
      DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: 401,
          data: {
            'error': {
              'code': 'INVALID_CREDENTIALS',
              'message': 'Invalid credentials',
            },
          },
        ),
      ),
    );

    final result = await AuthRemoteDataSource(
      dio,
      MockStorage(),
    ).login('user@example.com', 'wrong-password');

    expect(result, isA<AuthFailure<String>>());
    expect((result as AuthFailure<String>).statusCode, 401);
  });
}
