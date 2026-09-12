import 'package:dio/dio.dart';

String apiErrorMessage(DioException error) {
  final status = error.response?.statusCode;
  final body = error.response?.data;
  if (body is Map && body['error'] is Map) {
    final errorBody = body['error'] as Map;
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
