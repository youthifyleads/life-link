import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

import '../network/api_client.dart';
import '../../features/auth/data/auth_remote_datasource.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/blood_requests/data/blood_request_remote_datasource.dart';
import '../../features/blood_requests/presentation/bloc/blood_request_bloc.dart';
import '../../features/documents/data/document_remote_datasource.dart';
import '../../features/documents/presentation/bloc/document_bloc.dart';
import '../../features/tracking/data/tracking_remote_datasource.dart';
import '../../features/tracking/presentation/bloc/tracking_bloc.dart';
import '../../features/notifications/data/notification_remote_datasource.dart';
import '../../features/notifications/presentation/bloc/notification_bloc.dart';
import '../../features/donor/data/donor_remote_datasource.dart';
import '../../features/donor/data/donor_repository.dart';
import '../../features/donor/presentation/bloc/donor_bloc.dart';
import '../../features/donor/presentation/bloc/donor_response_cubit.dart';
import '../../features/donor/presentation/bloc/donor_consent_cubit.dart';
import '../../features/caregiver/data/caregiver_remote_datasource.dart';
import '../../features/blood_bags/data/blood_bag_remote_datasource.dart';
import '../../features/blood_bags/data/blood_bag_repository.dart';
import '../../features/blood_bags/presentation/bloc/blood_bag_cubit.dart';
import '../../features/payments/data/payment_remote_datasource.dart';
import '../../features/payments/data/payment_repository.dart';
import '../localization/locale_cubit.dart';

final getIt = GetIt.instance;

void configureDependencies() {
  // 1. Core Services
  getIt.registerLazySingleton<FlutterSecureStorage>(
      () => const FlutterSecureStorage());

  getIt.registerLazySingleton<Dio>(
      () => ApiClient.create(getIt<FlutterSecureStorage>()));

  // 2. Data Sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSource(getIt<Dio>(), getIt<FlutterSecureStorage>()));
  getIt.registerLazySingleton<BloodRequestRemoteDataSource>(
      () => BloodRequestRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<DocumentRemoteDataSource>(
      () => DocumentRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<TrackingRemoteDataSource>(
      () => TrackingRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<NotificationRemoteDataSource>(
      () => NotificationRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<DonorRemoteDataSource>(
      () => DonorRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<DonorRepository>(
      () => DonorRepository(getIt<DonorRemoteDataSource>()));
  getIt.registerLazySingleton<CaregiverRemoteDataSource>(
      () => CaregiverRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<BloodBagRemoteDataSource>(
      () => BloodBagRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<BloodBagRepository>(
      () => BloodBagRepository(getIt<BloodBagRemoteDataSource>()));
  getIt.registerLazySingleton<PaymentRemoteDataSource>(
      () => PaymentRemoteDataSource(getIt<Dio>()));
  getIt.registerLazySingleton<PaymentRepository>(
      () => PaymentRepository(getIt<PaymentRemoteDataSource>()));

  // 3. Repositories (will be added here)

  // 4. BLoCs
  getIt
      .registerFactory<AuthBloc>(() => AuthBloc(getIt<AuthRemoteDataSource>()));
  getIt.registerFactory<BloodRequestBloc>(
      () => BloodRequestBloc(getIt<BloodRequestRemoteDataSource>()));
  getIt.registerFactory<DocumentBloc>(
      () => DocumentBloc(getIt<DocumentRemoteDataSource>()));
  getIt.registerFactory<TrackingBloc>(
      () => TrackingBloc(getIt<TrackingRemoteDataSource>()));
  getIt.registerFactory<NotificationBloc>(
      () => NotificationBloc(getIt<NotificationRemoteDataSource>()));
  getIt.registerFactory<DonorBloc>(
      () => DonorBloc(getIt<DonorRemoteDataSource>()));
  getIt.registerFactory<DonorResponseCubit>(
      () => DonorResponseCubit(getIt<DonorRepository>()));
  getIt.registerFactory<DonorConsentCubit>(
      () => DonorConsentCubit(getIt<DonorRepository>()));
  getIt.registerFactory<BloodBagCubit>(
      () => BloodBagCubit(getIt<BloodBagRepository>()));
  getIt.registerLazySingleton<LocaleCubit>(
      () => LocaleCubit(getIt<FlutterSecureStorage>()));
}
