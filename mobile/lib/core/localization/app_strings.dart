class AppStrings {
  AppStrings._();

  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'app_name': 'LifeLink',
      'login_title': 'Welcome Back',
      'login_subtitle': 'Sign in to continue saving lives',
      'email': 'Email Address',
      'password': 'Password',
      'sign_in': 'Sign In',
      'register_prompt': "Don't have an account? Register",
      'notifications': 'Notifications',
      'mark_all_read': 'Mark all read',
      'no_notifications': 'No notifications yet',
      'donor_feed': 'Donation Feed',
      'i_can_donate': 'I Can Donate',
      'urgent_request': 'Urgent Request',
      'needs_units': 'Needs @units Units • @component',
      'my_requests': 'My Blood Requests',
      'new_request': 'New Request',
      'create_request_title': 'New Blood Request',
      'blood_type': 'Blood Type',
      'blood_component': 'Blood Component',
      'quantity': 'Quantity (Units)',
      'urgent_checkbox': 'Mark as Urgent Emergency',
      'medical_reason': 'Medical Reason (Optional)',
      'notes': 'Notes (Optional)',
      'submit_request': 'Create Request',
      'request_details': 'Request Details',
      'supporting_docs': 'Supporting Documents',
      'upload': 'Upload',
      'no_docs': 'No documents uploaded yet',
      'qr_scanner': 'Scan Blood Bag QR',
      'point_camera': 'Point camera at the blood bag QR code',
      'bag_status': 'Blood Bag Status',
      'timeline': 'Status Timeline',
      'profile_settings': 'Profile & Settings',
      'eligibility_title': 'Donation Eligibility & History',
      'eligible': 'Eligible to Donate',
      'waiting_period': 'Waiting Period Active',
      'language': 'Language',
      'select_language': 'Select App Language',
      'arabic': 'العربية (Arabic)',
      'english': 'English',
      'logout': 'Logout',
      'waiting_queue_title':
          'Currently Unavailable in Inventory • In Waiting Queue',
      'waiting_queue_desc':
          'No matching stock is available in blood banks, or registered donors have not completed the required 6-month (180-day) recovery period. Your request is active in the live matching queue.',
      'proceed_to_payment': 'Proceed to Payment & Checkout',

      // Navigation & Roles
      'nav_home': 'Home',
      'nav_donate': 'Donate',
      'nav_tracking': 'Tracking',
      'nav_profile': 'Profile',
      'role_donor': 'I am a Donor',
      'role_caregiver': 'I am a Caregiver',
      'welcome_greeting': 'Welcome Back',
      'emergency_greeting': 'Emergency & Patient Care',

      // Donor Home
      'donate_hero_title': 'Donate Blood • Save a Life',
      'donate_hero_desc':
          'Schedule your next donation or explore critical emergency requests needing blood.',
      'book_donation_btn': 'Schedule Donation',
      'check_eligibility_btn': 'Check Eligibility',
      'urgent_alerts_header': 'Urgent Emergency Alerts',
      'view_all_btn': 'View All',

      // Caregiver Home
      'scan_order_hero_title': 'Scan Hospital Order Code',
      'scan_order_hero_desc':
          'Point camera at the order QR code to link instantly and track delivery.',
      'scan_camera_btn': 'Scan with Camera',
      'enter_code_manual_btn': 'Enter Code Manually',
      'patient_record_title': 'Patient Clinical Record',
      'patient_name_demo': 'Ahmed Mahmoud El-Saeed',
      'transfusion_needed_badge': 'Transfusion Required',
      'blood_type_label': 'Blood Type: ',
      'medical_file_label': 'Medical File: ',
      'view_details_link': 'View Details',
      'shipment_transit_title': 'Blood Shipment In Transit',
      'matched_unit_label': 'Matched Unit: A+ • Qasr El-Ayni Hospital (ER)',
      'eta_minutes_label': 'Estimated Arrival: 18 mins',
      'track_route_map_btn': 'Track Shipment Route on Map',

      // Delivery Route Map
      'route_screen_title': 'Shipment Route & Tracking',
      'distance_bank_hospital': 'Distance between Blood Bank & Hospital: 8.4 km',
      'remaining_dist_eta':
          'Remaining: 3.8 km • Estimated arrival in 18 mins',
      'shipment_details_header': 'Active Blood Shipment Details',
      'origin_blood_bank': 'Regional Central Blood Bank (Abbassia)',
      'origin_blood_bank_sub':
          'Departed & handed over to courier • 02:15 PM',
      'dest_hospital': 'Qasr El-Ayni Hospital (Emergency Dept.)',
      'dest_hospital_sub': 'Remaining 3.8 km • Expected 02:45 PM',
      'courier_name': 'Medical Courier: Capt. Hossam Ali',
      'courier_vehicle': 'Refrigerated vehicle • Plate: ABC 492',
      'back_to_home': 'Back to Home',
      'manual_code_title': 'Enter Request Code Manually',
      'manual_code_subtitle':
          'Enter the order number printed on hospital order form (e.g. REQ-8820-EG)',
      'confirm_and_search': 'Confirm & Search Shipment',
    },
    'ar': {
      'app_name': 'لايف لينك (LifeLink)',
      'login_title': 'مرحباً بك مجدداً',
      'login_subtitle': 'سجّل دخولك للمساهمة في إنقاذ الأرواح',
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'sign_in': 'تسجيل الدخول',
      'register_prompt': 'ليس لديك حساب؟ أنشئ حساباً الآن',
      'notifications': 'الإشعارات والتنبيهات',
      'mark_all_read': 'تحديد الكل كمقروء',
      'no_notifications': 'لا توجد إشعارات حالياً',
      'donor_feed': 'قائمة طلبات التبرع المتاحة',
      'i_can_donate': 'أنا متاح للتبرع بالدم',
      'urgent_request': 'حالة طارئة وعاجلة',
      'needs_units': 'مطلوب @units أكياس • @component',
      'my_requests': 'طلبات الدم الخاصة بي',
      'new_request': 'طلب دم جديد',
      'create_request_title': 'إنشاء طلب نقل دم جديد',
      'blood_type': 'فصيلة الدم المطلوبة',
      'blood_component': 'مكون الدم (بلازما / صفائح / دم كامل)',
      'quantity': 'الكمية المطلوبة (بالأكياس)',
      'urgent_checkbox': 'تحديد كحالة طارئة حرجة',
      'medical_reason': 'السبب الطبي أو اسم العملية (اختياري)',
      'notes': 'ملاحظات إضافية (اختياري)',
      'submit_request': 'إرسال طلب الدم',
      'request_details': 'تفاصيل ومتابعة الطلب',
      'supporting_docs': 'المستندات والروشتات الطبية',
      'upload': 'رفع ملف / روشتة',
      'no_docs': 'لم يتم رفع مستندات طبية حتى الآن',
      'qr_scanner': 'مسح كود كيس الدم (QR Code)',
      'point_camera': 'وجّه الكاميرا نحو كود الـ QR الموجود على كيس الدم',
      'bag_status': 'حالة وموقع كيس الدم',
      'timeline': 'مراحل التجهيز والتسليم',
      'profile_settings': 'الملف الشخصي والإعدادات',
      'eligibility_title': 'أهلية التبرع وسجل العمليات',
      'eligible': 'مؤهل للتبرع الآن',
      'waiting_period': 'فترة أمان سارية (غير مؤهل حالياً)',
      'language': 'اللغة (Language)',
      'select_language': 'اختر لغة التطبيق',
      'arabic': 'العربية (Arabic)',
      'english': 'English',
      'logout': 'تسجيل الخروج',
      'waiting_queue_title':
          'غير متاح بالمخزون حالياً • قيد المتابعة والانتظار',
      'waiting_queue_desc':
          'لا يتوفر رصيد فوري في بنوك الدم، أو أن المتبرعين لم يتجاوزوا فترة الأمان الطبية الإلزامية (6 أشهر / 180 يوماً). طلبك نشط في قائمة الانتظار.',
      'proceed_to_payment': 'المتابعة إلى الدفع والاستلام',

      // Navigation & Roles
      'nav_home': 'الرئيسية',
      'nav_donate': 'التبرع',
      'nav_tracking': 'المتابعة',
      'nav_profile': 'حسابي',
      'role_donor': 'أنا متبرع بالدم',
      'role_caregiver': 'أنا مرافق مريض',
      'welcome_greeting': 'مرحباً بك',
      'emergency_greeting': 'خدمات الطوارئ والمريض',

      // Donor Home
      'donate_hero_title': 'تبرع بالدم • أنقذ حياة',
      'donate_hero_desc':
          'سجل موعد تبرعك القادم أو استعرض الحالات الحرجة المحتاجة لنقل دم عاجل.',
      'book_donation_btn': 'حجز موعد تبرع جديد',
      'check_eligibility_btn': 'أهلية التبرع',
      'urgent_alerts_header': 'تنبيهات الحالات الحرجة والعاجلة',
      'view_all_btn': 'عرض الكل',

      // Caregiver Home
      'scan_order_hero_title': 'مسح كود طلب المستشفى',
      'scan_order_hero_desc':
          'وجّه الكاميرا لكود QR بنموذج الطلب للربط الفوري وتتبع التوصيل',
      'scan_camera_btn': 'مسح بالكاميرا',
      'enter_code_manual_btn': 'إدخال كود يدوياً',
      'patient_record_title': 'سجل وحالة المريض',
      'patient_name_demo': 'أحمد محمود السعيد',
      'transfusion_needed_badge': 'بحاجة لنقل دم',
      'blood_type_label': 'الفصيلة: ',
      'medical_file_label': 'الملف الطبي: ',
      'view_details_link': 'عرض التفاصيل',
      'shipment_transit_title': 'شحنة دم قيد التوصيل الآن',
      'matched_unit_label':
          'الكيس المتطابق: A+ • مستشفى قصر العيني (مبنى الطوارئ)',
      'eta_minutes_label': 'الوقت المتوقع للوصول: 18 دقيقة',
      'track_route_map_btn': 'متابعة مسار الشحنة على الخريطة',

      // Delivery Route Map
      'route_screen_title': 'مسار وتتبع الشحنة',
      'distance_bank_hospital': 'المسافة بين بنك الدم والمستشفى: 8.4 كم',
      'remaining_dist_eta':
          'المسافة المتبقية: 3.8 كم • الوصول المتوقع خلال 18 دقيقة',
      'shipment_details_header': 'تفاصيل شحنة الدم قيد النقل',
      'origin_blood_bank': 'بنك الدم المركزي الإقليمي (العباسية)',
      'origin_blood_bank_sub':
          'تم التحرك والتسليم للكابتن • 02:15 م',
      'dest_hospital': 'مستشفى قصر العيني (مبنى الطوارئ)',
      'dest_hospital_sub': 'المسافة المتبقية 3.8 كم • متوقع 02:45 م',
      'courier_name': 'مندوب النقل الطبي: كابتن حسام علي',
      'courier_vehicle': 'سيارة نقل مبردة مجهزة • لوحة: أ ب ج 492',
      'back_to_home': 'العودة للرئيسية',
      'manual_code_title': 'إدخال كود الطلب يدوياً',
      'manual_code_subtitle':
          'إذا تعذر استخدام الكاميرا أو للمحاكي، يمكنك إدخال رقم الطلب أو كود التتبع يدوياً',
      'confirm_and_search': 'تأكيد والبحث عن الشحنة',
    }
  };

  static String get(String key, {String locale = 'ar'}) {
    return _localizedValues[locale]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }
}
