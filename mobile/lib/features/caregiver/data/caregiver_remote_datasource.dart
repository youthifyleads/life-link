import 'package:dio/dio.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';
import '../../blood_requests/domain/models/blood_request_model.dart';
import '../domain/models/caregiver_models.dart';

class CaregiverRemoteDataSource {
  final Dio _dio;

  CaregiverRemoteDataSource(this._dio);

  Future<CaregiverBagScanModel> scanBag(String qrCode) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.qrBagScan,
        data: {'qr_code': qrCode},
      );
      return CaregiverBagScanModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<CaregiverBagScanModel> getBagByQr(String qrCode) async {
    try {
      final response = await _dio.get(ApiEndpoints.qrBag(qrCode));
      return CaregiverBagScanModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<List<Map<String, dynamic>>> getAllocations() async {
    try {
      final response = await _dio.get(ApiEndpoints.caregiverAllocations);
      return (response.data as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<List<PatientModel>> getPatients() async {
    try {
      final response = await _dio.get(ApiEndpoints.caregiverPatients);
      return (response.data as List)
          .map((item) => PatientModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<PatientModel> createPatient({
    required String fullName,
    required String bloodType,
    String? hospitalId,
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.caregiverPatients,
        data: {
          'full_name': fullName,
          'blood_type': bloodType,
          if (hospitalId != null && hospitalId.isNotEmpty)
            'hospital_id': hospitalId,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );
      return PatientModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<BloodRequestPublic> createPatientBloodRequest({
    required String patientId,
    required BloodRequestCreate request,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.caregiverPatientRequests(patientId),
        data: request.toJson(),
      );
      return BloodRequestPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<Map<String, dynamic>> initiateAllocationPayment(
      String allocationId) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.caregiverPaymentInitiate,
        data: {'allocation_id': allocationId},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<List<Map<String, dynamic>>> getPaymentHistory() async {
    try {
      final response = await _dio.get(ApiEndpoints.caregiverPaymentHistory);
      return (response.data as List)
          .map((item) => item as Map<String, dynamic>)
          .toList();
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<List<CaregiverAssignmentModel>> getAssignments() async {
    try {
      final response = await _dio.get(ApiEndpoints.caregiverAssignments);
      final List data = response.data as List;
      return data
          .map((item) =>
              CaregiverAssignmentModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<CaregiverAssignmentModel> getAssignmentById(
      String assignmentId) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.caregiverAssignmentById(assignmentId),
      );
      return CaregiverAssignmentModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<CaregiverAssignmentModel> createAssignment({
    required String bloodBagId,
    required String caregiverUserId,
    required String hospitalId,
    DateTime? assignmentDate,
    String status = 'assigned',
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.caregiverAssignments,
        data: {
          'blood_bag_id': bloodBagId,
          'caregiver_user_id': caregiverUserId,
          'hospital_id': hospitalId,
          if (assignmentDate != null)
            'assignment_date': assignmentDate.toUtc().toIso8601String(),
          'status': status,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );
      return CaregiverAssignmentModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<CaregiverAssignmentModel> updateAssignment(
    String assignmentId, {
    String? status,
    String? notes,
    DateTime? assignmentDate,
  }) async {
    try {
      final response = await _dio.patch(
        ApiEndpoints.caregiverAssignmentById(assignmentId),
        data: {
          if (status != null && status.isNotEmpty) 'status': status,
          if (notes != null) 'notes': notes,
          if (assignmentDate != null)
            'assignment_date': assignmentDate.toUtc().toIso8601String(),
        },
      );
      return CaregiverAssignmentModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }

  Future<List<DonorMatchModel>> getMatches(String requestId) async {
    try {
      final response = await _dio.get(ApiEndpoints.caregiverMatches(requestId));
      return (response.data as List)
          .map((item) => DonorMatchModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (error) {
      throw apiErrorMessage(error);
    }
  }
}
