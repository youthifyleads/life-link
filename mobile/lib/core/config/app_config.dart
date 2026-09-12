/// App-wide environment configuration.
/// Switch between dev / staging / production without touching business logic.
class AppConfig {
  AppConfig._();

  // ─── Toggle environment here (use --dart-define in CI/CD) ───
  static const String _env =
      String.fromEnvironment('APP_ENV', defaultValue: 'dev');

  static bool get isDev => _env == 'dev';
  static bool get isAzureDevelopment => _env == 'azure';
  static bool get isProduction => _env == 'production';

  // ─── Base URLs ───────────────────────────────────────────────
  static const String _devBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue:
        'https://lifelink-backend-dev-g7cwf7gsf3cxdaba.centralus-01.azurewebsites.net/api/v1',
  );
  static const String _stagingBaseUrl =
      'https://lifelink-backend-staging.azurewebsites.net/api/v1';
  static const String _azureDevelopmentBaseUrl =
      'https://lifelink-backend-dev-g7cwf7gsf3cxdaba.centralus-01.azurewebsites.net/api/v1';
  static const String _productionBaseUrl = 'https://api.lifelink.org/api/v1';

  static String get baseUrl {
    switch (_env) {
      case 'production':
        return _productionBaseUrl;
      case 'staging':
        return _stagingBaseUrl;
      case 'azure':
        return _azureDevelopmentBaseUrl;
      default:
        return _devBaseUrl;
    }
  }

  // ─── HTTP Settings ───────────────────────────────────────────
  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // ─── Storage Keys ────────────────────────────────────────────
  static const String accessTokenKey = 'lifelink_access_token';
  static const String refreshTokenKey = 'lifelink_refresh_token';
  static const String userKey = 'lifelink_user';

  // ─── App Info ────────────────────────────────────────────────
  static const String appName = 'LifeLink';
  static const String supportEmail = 'support@lifelink.org';
}
