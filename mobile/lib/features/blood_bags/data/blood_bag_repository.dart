import '../domain/models/blood_bag_models.dart';
import 'blood_bag_remote_datasource.dart';

class BloodBagRepository {
  BloodBagRepository(this._dataSource);

  final BloodBagRemoteDataSource _dataSource;

  Future<List<BloodBagModel>> list() => _dataSource.list();

  Future<BloodBagScanResult> scan(String qrCode) => _dataSource.scan(qrCode);

  Future<BloodBagQrModel> getQr(String id) => _dataSource.getQr(id);

  Future<void> updateStatus(String id, BloodBagStatusUpdate update) =>
      _dataSource.updateStatus(id, update);

  Future<List<Map<String, dynamic>>> history(String id) =>
      _dataSource.history(id);
}
