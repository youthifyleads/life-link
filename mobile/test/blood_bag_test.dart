import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/core/constants/api_endpoints.dart';
import 'package:lifelink_mobile/features/blood_bags/data/blood_bag_remote_datasource.dart';
import 'package:lifelink_mobile/features/blood_bags/domain/models/blood_bag_models.dart';

class _MockDio extends Mock implements Dio {}

void main() {
  late _MockDio dio;
  late BloodBagRemoteDataSource source;

  setUp(() {
    dio = _MockDio();
    source = BloodBagRemoteDataSource(dio);
  });

  test('loads and parses blood bags', () async {
    when(() => dio.get(ApiEndpoints.bloodBags)).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: ApiEndpoints.bloodBags),
        data: [
          {
            'id': 'bag-1',
            'blood_type': 'O+',
            'component': 'whole_blood',
            'quantity': 1,
            'collection_date': '2026-09-15',
            'qr_code': 'qr-1',
            'status': 'available',
            'donation_id': 'donation-1',
          }
        ],
      ),
    );

    final bags = await source.list();
    expect(bags.single.id, 'bag-1');
    expect(bags.single.status, 'available');
  });

  test('scans a blood bag through the backend', () async {
    when(
      () => dio.post(ApiEndpoints.bloodBagScan, data: {'qr_code': 'qr-1'}),
    ).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: ApiEndpoints.bloodBagScan),
        data: {
          'blood_bag': {
            'id': 'bag-1',
            'blood_type': 'O+',
            'quantity': 1,
            'qr_code': 'qr-1',
            'status': 'available',
            'donation_id': 'donation-1',
          },
          'movement_history': [],
        },
      ),
    );

    final result = await source.scan('qr-1');
    expect(result.bloodBag.id, 'bag-1');
    verify(
        () => dio.post(ApiEndpoints.bloodBagScan, data: {'qr_code': 'qr-1'}));
  });

  test('parses the Azure QR payload and status update request', () {
    final qr = BloodBagQrModel.fromJson(const {
      'blood_bag_id': 'bag-1',
      'qr_payload': 'lifelink:bag-1',
    });
    const update = BloodBagStatusUpdate(
      status: 'available',
      location: 'Central bank',
      notes: 'Received',
    );

    expect(qr.qrPayload, 'lifelink:bag-1');
    expect(update.toJson(), const {
      'status': 'available',
      'location': 'Central bank',
      'notes': 'Received',
    });
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
