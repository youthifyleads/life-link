import 'package:dio/dio.dart';

import '../domain/models/document_model.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_error_message.dart';

class DocumentRemoteDataSource {
  final Dio _dio;

  DocumentRemoteDataSource(this._dio);

  /// GET /api/v1/requests/{request_id}/documents
  Future<List<DocumentPublic>> getDocuments(String requestId) async {
    try {
      final response = await _dio.get(ApiEndpoints.listDocuments(requestId));
      final List data = response.data as List;
      return data
          .map((json) => DocumentPublic.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  /// POST /api/v1/requests/{request_id}/documents
  Future<DocumentPublic> uploadDocument(
      String requestId, String filePath, String fileName) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await _dio.post(
        ApiEndpoints.uploadDocument(requestId),
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      return DocumentPublic.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _extractMessage(e);
    }
  }

  String _extractMessage(DioException e) {
    return apiErrorMessage(e);
  }
}
