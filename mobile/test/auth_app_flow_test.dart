import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lifelink_mobile/features/auth/data/auth_remote_datasource.dart';
import 'package:lifelink_mobile/features/auth/domain/models/user_model.dart';
import 'package:lifelink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

class _FlowAuthDataSource extends AuthRemoteDataSource {
  _FlowAuthDataSource() : super(Dio(), const FlutterSecureStorage());

  final Map<String, String> flows = {};
  late UserModel currentUser;

  @override
  Future<AuthResult<String>> login(String email, String password) async {
    currentUser = UserModel(
      id: email == 'donor@example.com' ? 'donor-id' : 'caregiver-id',
      email: email,
      fullName: email,
      role: UserRole.normalUser,
    );
    return AuthSuccess('token-$email');
  }

  @override
  Future<AuthResult<UserModel>> getMe() async => AuthSuccess(currentUser);

  @override
  Future<void> saveToken(String token) async {}

  @override
  Future<void> persistSession(String token, UserModel user,
      {String? refreshToken}) async {}

  @override
  Future<String?> getStoredAppFlow(UserModel user) async => flows[user.id];

  @override
  Future<void> saveAppFlow(UserModel user, String flow) async {
    flows[user.id] = flow;
  }

  @override
  Future<void> logout() async {}
}

UserModel _user(String id, String email) => UserModel(
      id: id,
      email: email,
      fullName: email,
      role: UserRole.normalUser,
    );

void main() {
  test('restores a donor flow for the same account after logout and login',
      () async {
    final dataSource = _FlowAuthDataSource();
    final bloc = AuthBloc(dataSource);

    bloc.add(AuthLoginEvent('donor@example.com', 'password'));
    await bloc.stream.firstWhere((state) => state is AuthFlowSelectionRequired);
    bloc.add(AuthSelectFlowEvent('donor'));
    final selected =
        await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    expect((selected as AuthAuthenticated).appFlow, 'donor');

    bloc.add(AuthLogoutEvent());
    await bloc.stream.firstWhere((state) => state is AuthUnauthenticated);
    bloc.add(AuthLoginEvent('donor@example.com', 'password'));
    final restored =
        await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    expect((restored as AuthAuthenticated).appFlow, 'donor');
    await bloc.close();
  });

  test('restores a caregiver flow for the same account after logout and login',
      () async {
    final dataSource = _FlowAuthDataSource();
    final bloc = AuthBloc(dataSource);

    bloc.add(AuthLoginEvent('caregiver@example.com', 'password'));
    await bloc.stream.firstWhere((state) => state is AuthFlowSelectionRequired);
    bloc.add(AuthSelectFlowEvent('caregiver'));
    await bloc.stream.firstWhere((state) => state is AuthAuthenticated);

    bloc.add(AuthLogoutEvent());
    await bloc.stream.firstWhere((state) => state is AuthUnauthenticated);
    bloc.add(AuthLoginEvent('caregiver@example.com', 'password'));
    final restored =
        await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    expect((restored as AuthAuthenticated).appFlow, 'caregiver');
    await bloc.close();
  });

  test('does not inherit another account appFlow', () async {
    final dataSource = _FlowAuthDataSource();
    final bloc = AuthBloc(dataSource);

    bloc.add(AuthLoginEvent('donor@example.com', 'password'));
    await bloc.stream.firstWhere((state) => state is AuthFlowSelectionRequired);
    bloc.add(AuthSelectFlowEvent('donor'));
    await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    bloc.add(AuthLogoutEvent());
    await bloc.stream.firstWhere((state) => state is AuthUnauthenticated);

    bloc.add(AuthLoginEvent('caregiver@example.com', 'password'));
    final state =
        await bloc.stream.firstWhere((state) => state is AuthFlowSelectionRequired);
    expect((state as AuthFlowSelectionRequired).user,
        _user('caregiver-id', 'caregiver@example.com'));
    expect(dataSource.flows, {'donor-id': 'donor'});
    await bloc.close();
  });

  test('does not replace an existing account appFlow', () async {
    final dataSource = _FlowAuthDataSource();
    final bloc = AuthBloc(dataSource);

    bloc.add(AuthLoginEvent('donor@example.com', 'password'));
    await bloc.stream.firstWhere((state) => state is AuthFlowSelectionRequired);
    bloc.add(AuthSelectFlowEvent('donor'));
    await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    bloc.add(AuthLogoutEvent());
    await bloc.stream.firstWhere((state) => state is AuthUnauthenticated);

    bloc.add(AuthLoginEvent('donor@example.com', 'password'));
    final restored =
        await bloc.stream.firstWhere((state) => state is AuthAuthenticated);
    expect((restored as AuthAuthenticated).appFlow, 'donor');
    await bloc.close();
  });
}
