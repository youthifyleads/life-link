import 'package:equatable/equatable.dart';

class DonorResponseModel extends Equatable {
  const DonorResponseModel({
    required this.id,
    required this.bloodRequestId,
    required this.status,
    this.responseDate,
    this.notes,
    this.donorId,
  });

  final String id;
  final String bloodRequestId;
  final String status;
  final DateTime? responseDate;
  final String? notes;
  final String? donorId;

  factory DonorResponseModel.fromJson(Map<String, dynamic> json) {
    return DonorResponseModel(
      id: json['id']?.toString() ?? '',
      bloodRequestId: json['blood_request_id']?.toString() ?? '',
      status: json['status']?.toString() ?? 'unknown',
      responseDate: json['response_date'] != null
          ? DateTime.tryParse(json['response_date'].toString())
          : null,
      notes: json['notes']?.toString(),
      donorId: json['donor_id']?.toString(),
    );
  }

  @override
  List<Object?> get props =>
      [id, bloodRequestId, status, responseDate, notes, donorId];
}
