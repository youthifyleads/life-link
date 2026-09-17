import 'package:flutter_test/flutter_test.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_consent_model.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_response_model.dart';

void main() {
  test('parses donor response fields from the API contract', () {
    final response = DonorResponseModel.fromJson(const {
      'id': 'response-1',
      'response_date': '2026-09-15T10:00:00Z',
      'status': 'accepted',
      'notes': 'Available',
      'blood_request_id': 'request-1',
      'donor_id': 'donor-1',
    });

    expect(response.id, 'response-1');
    expect(response.bloodRequestId, 'request-1');
    expect(response.status, 'accepted');
  });

  test('parses donor consent fields from the API contract', () {
    final consent = DonorConsentModel.fromJson(const {
      'id': 'consent-1',
      'donor_id': 'donor-1',
      'consent_type': 'donation_information',
      'granted': true,
      'granted_at': '2026-09-15T10:00:00Z',
      'revoked_at': null,
    });

    expect(consent.consentType, 'donation_information');
    expect(consent.granted, isTrue);
    expect(consent.revokedAt, isNull);
  });
}
