import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/features/caregiver/data/caregiver_remote_datasource.dart';
import 'package:lifelink_mobile/features/caregiver/domain/models/caregiver_models.dart';
import 'package:lifelink_mobile/features/tracking/domain/models/tracking_model.dart';

class _MockDio extends Mock implements Dio {}

void main() {
  test('tracking response remains mapped to TrackingPublic', () {
    final result = TrackingPublic.fromJson(const {
      'reference': 'track-1',
      'status': 'in_transit',
      'blood_type': 'O+',
      'component': 'whole_blood',
      'last_updated': '2026-09-18T08:00:00Z',
    });

    expect(result.reference, 'track-1');
    expect(result.status, 'in_transit');
  });

  test('caregiver scan maps a complete response without ID remapping', () {
    final result = CaregiverBagScanModel.fromJson({
      'blood_bag_id': 'bag-1',
      'request_id': 'request-1',
      'blood_type': 'O+',
      'component': 'whole_blood',
      'quantity': 2,
      'status': 'assigned',
      'bank_name': 'Central Blood Bank',
      'bank_location': 'Cairo',
      'qr_code': 'qr-1',
      'unit_price': 350,
      'total_price': 700,
      'payment_status': 'unpaid',
      'payment_url': null,
    });

    expect(result.requestId, 'request-1');
    expect(result.bloodBagId, 'bag-1');
    expect(result.unitPrice, 350);
    expect(result.totalPrice, 700);
    expect(result.paymentUrl, isNull);
  });

  test('caregiver scan preserves nullable request and pricing fields', () {
    final result = CaregiverBagScanModel.fromJson({
      'blood_bag_id': 'bag-2',
      'request_id': null,
      'blood_type': 'A+',
      'component': null,
      'quantity': 1,
      'status': 'available',
      'bank_name': 'Central Blood Bank',
      'bank_location': 'Cairo',
      'qr_code': null,
      'unit_price': null,
      'total_price': null,
      'payment_status': 'unpaid',
      'payment_url': null,
    });

    expect(result.requestId, isNull);
    expect(result.unitPrice, isNull);
    expect(result.totalPrice, isNull);
    expect(result.paymentUrl, isNull);
  });

  test('caregiver datasource uses the QR scan endpoint and payload', () async {
    final dio = _MockDio();
    when(() => dio.post(
          '/caregiver/scan-bag',
          data: {'qr_code': 'scanned-value'},
        )).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/caregiver/scan-bag'),
        data: {
          'blood_bag_id': 'bag-1',
          'request_id': null,
          'blood_type': 'O+',
          'status': 'available',
          'bank_name': 'Bank',
          'bank_location': 'Cairo',
          'payment_status': 'unpaid',
        },
      ),
    );

    final result =
        await CaregiverRemoteDataSource(dio).scanBag('scanned-value');

    expect(result.bloodBagId, 'bag-1');
    expect(result.requestId, isNull);
    verify(() => dio.post(
          '/caregiver/scan-bag',
          data: {'qr_code': 'scanned-value'},
        )).called(1);
  });

  test('caregiver datasource exposes API failures', () async {
    final dio = _MockDio();
    final error = DioException(
      requestOptions: RequestOptions(path: '/caregiver/scan-bag'),
      response: Response(
        requestOptions: RequestOptions(path: '/caregiver/scan-bag'),
        statusCode: 404,
        data: {
          'error': {'message': 'Blood bag or request not found'},
        },
      ),
    );
    when(() => dio.post(
          '/caregiver/scan-bag',
          data: {'qr_code': 'missing'},
        )).thenThrow(error);

    await expectLater(
      CaregiverRemoteDataSource(dio).scanBag('missing'),
      throwsA(isA<String>()),
    );
  });
}
