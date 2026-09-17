import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/core/constants/api_endpoints.dart';
import 'package:lifelink_mobile/features/donor/data/donor_remote_datasource.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_profile_model.dart';

class _MockDio extends Mock implements Dio {}

void main() {
  late _MockDio dio;
  late DonorRemoteDataSource dataSource;

  setUp(() {
    dio = _MockDio();
    dataSource = DonorRemoteDataSource(dio);
  });

  test('loads nearby donor requests using the current API contract', () async {
    when(() => dio.get(ApiEndpoints.donorNearbyRequests)).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: ApiEndpoints.donorNearbyRequests),
        data: [
          {
            'request_id': 'request-1',
            'hospital_name': 'Hospital One',
            'blood_type': 'O+',
            'component': 'whole_blood',
            'quantity_units': 2,
            'urgency': true,
            'created_at': '2026-09-15T10:00:00Z',
          },
        ],
      ),
    );

    final requests = await dataSource.getNearbyRequests();

    expect(requests.single.requestId, 'request-1');
    expect(requests.single.quantityUnits, 2);
    expect(requests.single.urgency, isTrue);
  });

  test('parses a completed donation without inventing voucher data', () {
    final donation = DonationHistoryItem.fromJson(const {
      'id': 'donation-1',
      'blood_type': 'A+',
      'quantity': '450',
      'donation_date': '2026-09-15',
      'status': 'completed',
      'donor_id': 'donor-1',
      'blood_bank_id': 'bank-1',
      'created_at': '2026-09-15T10:00:00Z',
    });

    expect(donation.id, 'donation-1');
    expect(donation.status, 'completed');
    expect(donation.bloodBankId, 'bank-1');
    expect(donation.hospitalName, 'bank-1');
  });

  test('sends a real donation response to the backend', () async {
    when(
      () => dio.post(
        ApiEndpoints.donorResponses,
        data: any(named: 'data'),
      ),
    ).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: ApiEndpoints.donorResponses),
        data: {'id': 'response-1'},
      ),
    );

    await dataSource.respondToRequest('request-1', 'accepted');

    verify(
      () => dio.post(
        ApiEndpoints.donorResponses,
        data: {
          'blood_request_id': 'request-1',
          'status': 'accepted',
          'notes': '',
        },
      ),
    ).called(1);
  });
}
