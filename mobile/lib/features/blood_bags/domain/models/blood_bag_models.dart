class BloodBagModel {
  const BloodBagModel({
    required this.id,
    required this.bloodType,
    required this.component,
    required this.quantity,
    required this.status,
    this.collectionDate,
    this.qrCode,
    this.donationId,
  });

  final String id;
  final String bloodType;
  final String component;
  final int quantity;
  final String status;
  final DateTime? collectionDate;
  final String? qrCode;
  final String? donationId;

  factory BloodBagModel.fromJson(Map<String, dynamic> json) {
    return BloodBagModel(
      id: json['id'] as String? ?? '',
      bloodType: json['blood_type'] as String? ?? '',
      component: json['component'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'unknown',
      collectionDate: json['collection_date'] != null
          ? DateTime.tryParse(json['collection_date'].toString())
          : null,
      qrCode: json['qr_code'] as String?,
      donationId: json['donation_id'] as String?,
    );
  }
}

class BloodBagQrModel {
  const BloodBagQrModel({required this.bloodBagId, required this.qrPayload});

  final String bloodBagId;
  final String qrPayload;

  factory BloodBagQrModel.fromJson(Map<String, dynamic> json) {
    return BloodBagQrModel(
      bloodBagId: json['blood_bag_id'] as String? ?? '',
      qrPayload: json['qr_payload'] as String? ?? '',
    );
  }
}

class BloodBagScanResult {
  const BloodBagScanResult(
      {required this.bloodBag, this.movementHistory = const []});

  final BloodBagModel bloodBag;
  final List<Map<String, dynamic>> movementHistory;

  factory BloodBagScanResult.fromJson(Map<String, dynamic> json) {
    final bloodBagJson = json['blood_bag'] as Map<String, dynamic>? ?? const {};
    final movementHistory = (json['movement_history'] as List?)
            ?.map((item) => Map<String, dynamic>.from(item as Map))
            .toList() ??
        const <Map<String, dynamic>>[];

    return BloodBagScanResult(
      bloodBag: BloodBagModel.fromJson(bloodBagJson),
      movementHistory: movementHistory,
    );
  }
}

class BloodBagStatusUpdate {
  const BloodBagStatusUpdate({
    required this.status,
    this.location,
    this.notes,
  });

  final String status;
  final String? location;
  final String? notes;

  Map<String, dynamic> toJson() => {
        'status': status,
        if (location != null) 'location': location,
        if (notes != null) 'notes': notes,
      };
}
