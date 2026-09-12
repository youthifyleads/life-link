import 'package:equatable/equatable.dart';

class TrackingPublic extends Equatable {
  final String reference;
  final String status;
  final String bloodType;
  final String component;
  final DateTime lastUpdated;

  const TrackingPublic({
    required this.reference,
    required this.status,
    required this.bloodType,
    required this.component,
    required this.lastUpdated,
  });

  factory TrackingPublic.fromJson(Map<String, dynamic> json) {
    return TrackingPublic(
      reference: json['reference'] as String,
      status: json['status'] as String,
      bloodType: json['blood_type'] as String,
      component: json['component'] as String,
      lastUpdated: DateTime.parse(json['last_updated'] as String),
    );
  }

  @override
  List<Object?> get props =>
      [reference, status, bloodType, component, lastUpdated];
}
