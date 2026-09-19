import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/core/constants/api_endpoints.dart';
import 'package:lifelink_mobile/features/tracking/data/tracking_remote_datasource.dart';
import 'package:lifelink_mobile/features/tracking/domain/models/tracking_model.dart';

class _MockDio extends Mock implements Dio {}

void main() {
  late _MockDio dio;
  late TrackingRemoteDataSource source;

  setUp(() {
    dio = _MockDio();
    source = TrackingRemoteDataSource(dio);
  });

  test('scans hospital blood request QR and parses full tracking and pricing data', () async {
    when(() => dio.post(
          ApiEndpoints.qrScan,
          data: {'reference': 'req_12345'},
        )).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: ApiEndpoints.qrScan),
        data: {
          'reference': 'req_12345',
          'status': 'prepared',
          'blood_type': 'O+',
          'component': 'plasma',
          'last_updated': '2026-09-18T10:00:00Z',
          'request_id': 'req_12345',
          'unit_price': 350.0,
          'total_price': 700.0,
          'payment_status': 'unpaid',
          'bank_name': 'Central Blood Bank',
          'bank_location': 'Tahrir Sq, Cairo',
          'quantity': 2,
        },
      ),
    );

    final result = await source.scanQr('req_12345');
    expect(result.reference, 'req_12345');
    expect(result.requestId, 'req_12345');
    expect(result.bloodType, 'O+');
    expect(result.component, 'plasma');
    expect(result.unitPrice, 350.0);
    expect(result.totalPrice, 700.0);
    expect(result.paymentStatus, 'unpaid');
    expect(result.isPaid, isFalse);
    expect(result.bankName, 'Central Blood Bank');
    expect(result.quantity, 2);
  });

  test('parses paid status correctly', () {
    final tracking = TrackingPublic.fromJson(const {
      'reference': 'ref_paid',
      'status': 'completed',
      'blood_type': 'A+',
      'component': 'whole_blood',
      'last_updated': '2026-09-18T12:00:00Z',
      'payment_status': 'paid',
    });

    expect(tracking.isPaid, isTrue);
    expect(tracking.status, 'completed');
  });

  test('updates blood bag status through the Azure status endpoint', () async {
    const update = BloodBagStatusUpdate(
      status: 'prepared',
      location: 'Central bank',
      notes: 'Moved',
    );
    when(
      () => dio.patch(
        ApiEndpoints.bloodBagStatus('bag-1'),
        data: update.toJson(),
      ),
    ).thenAnswer(
      (_) async => Response(
        requestOptions:
            RequestOptions(path: ApiEndpoints.bloodBagStatus('bag-1')),
      ),
    );

    await source.updateStatus('bag-1', update);

    verify(
      () => dio.patch(
        ApiEndpoints.bloodBagStatus('bag-1'),
        data: update.toJson(),
      ),
    ).called(1);
  });
}
