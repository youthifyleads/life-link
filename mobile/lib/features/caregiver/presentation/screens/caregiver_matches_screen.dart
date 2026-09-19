import 'package:flutter/material.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/widgets/lifelink_states.dart';
import '../../../../core/widgets/lifelink_components.dart';
import '../../data/caregiver_remote_datasource.dart';
import '../../domain/models/caregiver_models.dart';

class CaregiverMatchesScreen extends StatefulWidget {
  final String requestId;

  const CaregiverMatchesScreen({super.key, required this.requestId});

  @override
  State<CaregiverMatchesScreen> createState() => _CaregiverMatchesScreenState();
}

class _CaregiverMatchesScreenState extends State<CaregiverMatchesScreen> {
  late Future<List<DonorMatchModel>> _matches;

  @override
  void initState() {
    super.initState();
    _matches = getIt<CaregiverRemoteDataSource>().getMatches(widget.requestId);
  }

  void _reload() {
    setState(() {
      _matches =
          getIt<CaregiverRemoteDataSource>().getMatches(widget.requestId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المتبرعون المتطابقون')),
      body: FutureBuilder<List<DonorMatchModel>>(
        future: _matches,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LifeLinkLoadingState(
              message: 'جاري البحث عن متبرعين متطابقين...',
            );
          }
          if (snapshot.hasError) {
            return LifeLinkStatePanel(
              icon: Icons.cloud_off_rounded,
              title: 'تعذر جلب بيانات المتبرعين',
              message:
                  'يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.',
              actionLabel: 'إعادة المحاولة',
              onAction: _reload,
              tone: Colors.orange.shade800,
            );
          }
          final matches = snapshot.data ?? const <DonorMatchModel>[];
          if (matches.isEmpty) {
            return const LifeLinkStatePanel(
              icon: Icons.person_search_rounded,
              title: 'لا يوجد متبرعون متاحون حالياً',
              message:
                  'لم يتم العثور على متبرعين مؤهلين ومطابقين لهذه الفصيلة في الوقت الحالي. سيتم تنبيهك فور توفر متبرع.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: matches.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final match = matches[index];
                final statusLabel = match.eligible
                    ? 'مؤهل للتبرع'
                    : match.eligibilityStatus == 'cooling_down'
                        ? 'في فترة الراحة الطبية'
                        : 'غير مؤهل حالياً';
                return LifeLinkMatchCard(
                  donorLabel: 'متبرع #${match.donorId}',
                  bloodType: match.bloodType,
                  status: statusLabel,
                  distance: match.distanceKm > 0
                      ? 'على بعد ${match.distanceKm.toStringAsFixed(1)} كم'
                      : null,
                );
              },
            ),
          );
        },
      ),
    );
  }
}
