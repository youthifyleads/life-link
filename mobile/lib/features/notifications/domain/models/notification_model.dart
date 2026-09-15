import 'package:equatable/equatable.dart';

/// Mapped exactly from NotificationPublic schema in OpenAPI v0.1.0
class NotificationModel extends Equatable {
  final String id;
  final String userId;
  final String trigger;
  final String message;
  final bool isRead;
  final String? relatedRequestId;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.trigger,
    required this.message,
    required this.isRead,
    this.relatedRequestId,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      trigger: json['trigger'] as String,
      message: json['message'] as String,
      isRead: json['is_read'] as bool? ?? false,
      relatedRequestId: json['related_request_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  /// Local copy with isRead flipped — used optimistically while API confirms
  NotificationModel copyWithRead() => NotificationModel(
        id: id,
        userId: userId,
        trigger: trigger,
        message: message,
        isRead: true,
        relatedRequestId: relatedRequestId,
        createdAt: createdAt,
      );

  @override
  List<Object?> get props => [id, isRead, trigger, createdAt];
}
