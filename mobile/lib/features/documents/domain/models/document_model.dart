import 'package:equatable/equatable.dart';

class DocumentPublic extends Equatable {
  final String id;
  final String bloodRequestId;
  final String fileName;
  final String status;
  final DateTime uploadedAt;
  final String? fileType;
  final String filePath;
  final DateTime? reviewedAt;
  final String? rejectionReason;

  const DocumentPublic({
    required this.id,
    required this.bloodRequestId,
    required this.fileName,
    required this.status,
    required this.uploadedAt,
    this.fileType,
    required this.filePath,
    this.reviewedAt,
    this.rejectionReason,
  });

  factory DocumentPublic.fromJson(Map<String, dynamic> json) {
    return DocumentPublic(
      id: json['id'] as String,
      bloodRequestId: json['blood_request_id'] as String,
      fileName: json['file_name'] as String,
      status: json['status'] as String,
      uploadedAt: DateTime.parse(json['uploaded_at'] as String),
      fileType: json['file_type'] as String?,
      filePath: json['file_path'] as String,
      reviewedAt: json['reviewed_at'] != null
          ? DateTime.parse(json['reviewed_at'] as String)
          : null,
      rejectionReason: json['rejection_reason'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, status, fileName, uploadedAt];
}
