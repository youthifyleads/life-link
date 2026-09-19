import 'package:dio/dio.dart';

String apiErrorMessage(DioException error) {
  final status = error.response?.statusCode;
  final body = error.response?.data;
  if (body is Map && body['error'] is Map) {
    final errorBody = body['error'] as Map;
    final code = errorBody['code']?.toString();
    if (code == 'PAYMENT_PRICING_NOT_CONFIGURED') {
      return 'Payment pricing is not available yet. Please try again later.';
    }
    if (code == 'PAYMENT_PROVIDER_NOT_CONFIGURED' ||
        code == 'PAYMENT_PROVIDER_UNAVAILABLE' ||
        code == 'PAYMENT_PROVIDER_INVALID_RESPONSE') {
      return "We couldn't start your payment. Please try again.";
    }
    if (code == 'OTP_EXPIRED') {
      return 'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا';
    }
    if (code == 'OTP_RATE_LIMITED' || code == 'RATE_LIMITED') {
      return 'تم طلب رموز تحقق كثيرة. انتظر قليلًا ثم حاول مرة أخرى';
    }
    if (code == 'OTP_ATTEMPTS_EXCEEDED') {
      return 'تم تجاوز عدد محاولات رمز التحقق';
    }
    final message = errorBody['message']?.toString();
    if (message != null && message.isNotEmpty) return message;
  }

  if (status != null) {
    switch (status) {
      case 401:
        return 'انتهت جلسة العمل أو يلزم تسجيل الدخول.';
      case 403:
        return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
      case 404:
        return 'المورد المطلوب غير موجود.';
      case 422:
        return 'يرجى التحقق من البيانات المدخلة.';
      default:
        if (status >= 500) return 'الخادم غير متاح حالياً. حاول لاحقاً.';
    }
  }

  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.sendTimeout:
      return 'انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.';
    case DioExceptionType.connectionError:
      return 'تعذر الوصول إلى الخادم. تحقق من الشبكة أو حاول لاحقاً.';
    default:
      return 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.';
  }
}

String friendlyErrorMessage(Object error) {
  if (error is DioException) return apiErrorMessage(error);
  if (error is String && error.trim().isNotEmpty) return error;
  return 'تعذر إكمال العملية الآن. تحقق من الاتصال وحاول مرة أخرى.';
}
