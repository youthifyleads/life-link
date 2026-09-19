import 'package:lifelink_mobile/features/donor/data/donor_remote_datasource.dart';
import 'package:lifelink_mobile/features/donor/domain/models/donor_profile_model.dart';

class DonorRepository {
  DonorRepository(this._dataSource);

  final DonorRemoteDataSource _dataSource;

  Future<DonorProfileModel> getProfile() => _dataSource.getProfile();

  Future<List<NearbyBloodRequest>> getNearbyRequests() =>
      _dataSource.getNearbyRequests();

  Future<List<Map<String, dynamic>>> getResponses() =>
      _dataSource.getResponses();

  Future<List<Map<String, dynamic>>> getConsents() => _dataSource.getConsents();

  Future<void> submitConsent(String consentType, bool granted) =>
      _dataSource.submitConsent(consentType, granted);
}
