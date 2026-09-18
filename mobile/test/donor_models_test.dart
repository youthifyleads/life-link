import 'package:flutter_test/flutter_test.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_profile_model.dart';
import 'package:lifelink_mobile/features/donor/domain/models/voucher_model.dart';

void main() {
  test('parses voucher model fields from the API contract', () {
    final voucher = VoucherModel.fromJson(const {
      'id': 'v-1',
      'donor_id': 'donor-1',
      'voucher_code': 'LL-SAVE25',
      'discount_percentage': 25.0,
      'partner_id': 'partner-1',
      'status': 'ACTIVE',
      'issued_at': '2026-09-15T10:00:00Z',
      'expires_at': '2026-12-31T23:59:59Z',
      'redeemed_at': null,
    });

    expect(voucher.id, 'v-1');
    expect(voucher.voucherCode, 'LL-SAVE25');
    expect(voucher.discountPercentage, 25.0);
    expect(voucher.status, 'ACTIVE');
    expect(voucher.isActive, isTrue);
  });

  test('parses donor profile model from API contract', () {
    final profile = DonorProfileModel.fromJson(const {
      'id': 'donor-1',
      'user_id': 'user-1',
      'blood_type': 'O+',
      'available': true,
      'eligibility_status': 'eligible',
      'total_donations': 3,
      'points': 150,
      'governorate': 'Cairo',
      'national_id': '12345678901234',
    });

    expect(profile.id, 'donor-1');
    expect(profile.bloodType, 'O+');
    expect(profile.isEligible, isTrue);
    expect(profile.totalDonations, 3);
  });
}
