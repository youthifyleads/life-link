import 'package:equatable/equatable.dart';

/// All roles exactly as returned by the LifeLink API v0.1.0.
/// Donor and Caregiver are documented as backend dependencies pending addition.
enum UserRole {
  hospitalUser, // hospital_user
  bloodBankOperator, // blood_bank_operator
  medicalLead, // medical_lead
  admin, // admin
  platformSupport, // platform_support
  normalUser, // normal_user

  // ── BACKEND DEPENDENCIES (not yet in API v0.1.0) ──────────
  donor, // donor — Required by mobile MVP
  caregiver, // caregiver — Required by mobile MVP
}

extension UserRoleX on UserRole {
  String get apiValue {
    switch (this) {
      case UserRole.hospitalUser:
        return 'hospital_user';
      case UserRole.bloodBankOperator:
        return 'blood_bank_operator';
      case UserRole.medicalLead:
        return 'medical_lead';
      case UserRole.admin:
        return 'admin';
      case UserRole.platformSupport:
        return 'platform_support';
      case UserRole.normalUser:
        return 'normal_user';
      case UserRole.donor:
        return 'donor';
      case UserRole.caregiver:
        return 'caregiver';
    }
  }

  static UserRole fromApi(String value) {
    switch (value) {
      case 'hospital_user':
        return UserRole.hospitalUser;
      case 'blood_bank_operator':
        return UserRole.bloodBankOperator;
      case 'medical_lead':
        return UserRole.medicalLead;
      case 'admin':
        return UserRole.admin;
      case 'platform_support':
        return UserRole.platformSupport;
      case 'normal_user':
        return UserRole.normalUser;
      case 'donor':
        return UserRole.donor;
      case 'caregiver':
        return UserRole.caregiver;
      default:
        return UserRole.platformSupport;
    }
  }

  bool get isDonor => this == UserRole.donor || this == UserRole.normalUser;
  bool get isCaregiver => this == UserRole.caregiver;
  bool get isHospitalUser => this == UserRole.hospitalUser;
  bool get isBloodBankOperator => this == UserRole.bloodBankOperator;
  bool get isAdmin => this == UserRole.admin;
}

/// Domain model for the authenticated user (mapped from UserPublic schema).
class UserModel extends Equatable {
  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String? phone;
  final String? institutionId;
  final bool isActive;

  const UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.phone,
    this.institutionId,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as String? ?? '',
        email: json['email'] as String? ?? '',
        fullName: json['full_name'] as String? ?? '',
        role: UserRoleX.fromApi(json['role'] as String? ?? 'donor'),
        phone: json['phone'] as String?,
        institutionId: json['institution_id'] as String?,
        isActive: json['is_active'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'role': role.apiValue,
        'phone': phone,
        'institution_id': institutionId,
        'is_active': isActive,
      };

  @override
  List<Object?> get props =>
      [id, email, fullName, role, phone, institutionId, isActive];
}
