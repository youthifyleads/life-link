import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:lifelink_mobile/features/caregiver/data/caregiver_remote_datasource.dart';
import 'package:lifelink_mobile/features/caregiver/domain/models/caregiver_models.dart';

class MockDio extends Mock implements Dio {}

void main() {
  late MockDio dio;
  late CaregiverRemoteDataSource dataSource;

  setUp(() {
    dio = MockDio();
    dataSource = CaregiverRemoteDataSource(dio);
  });

  test('parses a patient returned by the backend', () {
    final patient = PatientModel.fromJson({
      'id': 'patient-1',
      'caregiver_id': 'caregiver-1',
      'full_name': 'Patient One',
      'blood_type': 'A+',
      'created_at': '2026-09-11T10:00:00Z',
    });

    expect(patient.id, 'patient-1');
    expect(patient.fullName, 'Patient One');
    expect(patient.bloodType, 'A+');
  });

  test('lists patients from GET /caregiver/patients', () async {
    when(() => dio.get('/caregiver/patients')).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/caregiver/patients'),
        data: [
          {
            'id': 'patient-1',
            'full_name': 'Patient One',
            'blood_type': 'O+',
          },
        ],
      ),
    );

    final patients = await dataSource.getPatients();

    expect(patients, hasLength(1));
    expect(patients.single.bloodType, 'O+');
    verify(() => dio.get('/caregiver/patients')).called(1);
  });

  test('scans hospital request via caregiver endpoint', () async {
    when(
      () => dio.post(
        '/caregiver/scan-request',
        data: any(named: 'data'),
      ),
    ).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(
          path: '/caregiver/scan-request',
        ),
        data: {
          'tracking_reference': 'TRACK-HOSP-001',
          'request_id': 'req-1',
          'status': 'dispatched',
          'hospital_name': 'مستشفى السلام الدولي',
          'blood_type': 'O+',
          'quantity_units': 2,
          'total_price': 1500.0,
          'is_paid': false,
        },
      ),
    );

    final result = await dataSource.scanHospitalRequest('REQ-TOKEN-123');

    expect(result['tracking_reference'], 'TRACK-HOSP-001');
    expect(result['request_id'], 'req-1');
    expect(result['total_price'], 1500.0);
    verify(
      () => dio.post(
        '/caregiver/scan-request',
        data: {'qr_code': 'REQ-TOKEN-123'},
      ),
    ).called(1);
  });

  test('parses donor match eligibility from the backend', () {
    final match = DonorMatchModel.fromJson({
      'donor_id': 'donor-1',
      'user_id': 'user-1',
      'full_name': 'Donor One',
      'blood_type': 'O+',
      'eligibility_status': 'ineligible',
      'last_donation_date': '2026-09-01T10:00:00Z',
      'days_since_last_donation': 12,
      'distance_km': 4.5,
    });

    expect(match.fullName, 'Donor One');
    expect(match.eligibilityStatus, 'ineligible');
    expect(match.daysSinceLastDonation, 12);
    expect(match.distanceKm, 4.5);
  });

  test('parses caregiver assignment records from Azure contract', () {
    final assignment = CaregiverAssignmentModel.fromJson({
      'id': 'assignment-1',
      'blood_bag_id': 'bag-1',
      'caregiver_user_id': 'caregiver-1',
      'hospital_id': 'hospital-1',
      'assignment_date': '2026-09-12T10:00:00Z',
      'status': 'assigned',
      'notes': 'Deliver to ICU',
    });

    expect(assignment.id, 'assignment-1');
    expect(assignment.bloodBagId, 'bag-1');
    expect(assignment.status, 'assigned');
    expect(assignment.notes, 'Deliver to ICU');
  });

  test('lists caregiver assignments from the contract endpoint', () async {
    when(() => dio.get('/caregiver/assignments')).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/caregiver/assignments'),
        data: [
          {
            'id': 'assignment-1',
            'blood_bag_id': 'bag-1',
            'caregiver_user_id': 'caregiver-1',
            'hospital_id': 'hospital-1',
            'status': 'assigned',
            'assignment_date': '2026-09-12T10:00:00Z',
          },
        ],
      ),
    );

    final assignments = await dataSource.getAssignments();

    expect(assignments, hasLength(1));
    expect(assignments.single.bloodBagId, 'bag-1');
    verify(() => dio.get('/caregiver/assignments')).called(1);
  });
}
