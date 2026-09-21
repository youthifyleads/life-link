import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/widgets/lifelink_button.dart';
import '../../../../core/localization/localization_extension.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';

class MedicalScreeningQuizScreen extends StatefulWidget {
  final VoidCallback? onEligibleProceed;

  const MedicalScreeningQuizScreen({
    super.key,
    this.onEligibleProceed,
  });

  @override
  State<MedicalScreeningQuizScreen> createState() =>
      _MedicalScreeningQuizScreenState();
}

class _MedicalScreeningQuizScreenState
    extends State<MedicalScreeningQuizScreen> {
  int _currentStep = 0;
  bool _quizFinished = false;
  bool _isEligible = true;
  String _disqualificationReasonAr = '';
  String _disqualificationReasonEn = '';
  String _recommendedSafeWaitAr = '';
  String _recommendedSafeWaitEn = '';

  // Answers State
  String _gender = 'male'; // 'male' or 'female'
  bool? _isWeightAbove60;
  bool? _isAgeEligible; // for males: 18-60, for females: 18-40
  bool? _hadDentalProcedures; // false is good, true is disqualifying for 1-2 weeks
  bool? _tookProhibitedMeds; // false is good, true is disqualifying
  bool? _hadTattooOrHijama; // false is good, true is disqualifying for 1 year
  bool? _isPregnantOrNursing; // for females
  String _hemoglobinStatus = 'unknown'; // 'normal', 'low', 'unknown'
  bool? _feelingHealthyToday; // true is good

  @override
  void initState() {
    super.initState();
    // Prefill gender from authenticated user profile if available
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      if (authState.user.gender != null) {
        _gender = authState.user.gender!;
      }
      if (authState.user.weight != null) {
        _isWeightAbove60 = authState.user.weight! >= 60;
      }
    }
  }

  int get _totalSteps => _gender == 'female' ? 6 : 5;

  void _evaluateAndNext() {
    if (_currentStep == 0) {
      if (_isWeightAbove60 == false) {
        _finishWithIneligibility(
          reasonAr: 'الوزن يقل عن 60 كجم. تشترط الحملات وبنوك الدم المصرية وزناً لا يقل عن 60 كجم لضمان سلامتك وعدم تعرضك لهبوط حاد أو دوخة أثناء سحب وحدة الدم (نصف لتر).',
          reasonEn: 'Weight is below 60 kg. Egyptian campaigns enforce a 60kg minimum to safeguard donors against acute hypotension.',
          safeWaitAr: 'يمكنك المحاولة في مركز ثابت مع فحص الطبيب أو بعد استقرار الوزن.',
          safeWaitEn: 'Consult a static blood bank physician or re-evaluate when weight stabilizes.',
        );
        return;
      }
      if (_isAgeEligible == false) {
        if (_gender == 'female') {
          _finishWithIneligibility(
            reasonAr: 'تجاوز سن الأربعين للإناث (أكبر من 40 سنة) أو أقل من 18 سنة. في بنوك الدم المصرية، يُحظر تبرع الإناث فوق سن 40 لحماية مخزون الحديد (Ferritin) وكثافة العظام والوقاية من فقر الدم في مرحلة ما قبل انقطاع الطمث.',
            reasonEn: 'Age outside 18-40 range for females. Egyptian blood banks defer female donation beyond age 40 to preserve iron/ferritin reserves, bone density, and prevent perimenopausal anemia.',
            safeWaitAr: 'القاعدة الطبية الذهبية في مصر: سلامة المتبرع تأتي أولاً.',
            safeWaitEn: 'Donor safety is the golden rule.',
          );
        } else {
          _finishWithIneligibility(
            reasonAr: 'العمر خارج النطاق المسموح به للذكور (يجب أن يكون بين 18 و 60 سنة) طبقاً للمعايير القومية لخدمات نقل الدم في مصر.',
            reasonEn: 'Age is outside the 18-60 range permitted for male blood donation under Egyptian blood banking regulations.',
            safeWaitAr: 'يسمح بالتبرع فقط بين سن 18 و 60 عاماً.',
            safeWaitEn: 'Eligible strictly between 18 and 60 years of age.',
          );
        }
        return;
      }
    } else if (_currentStep == 1) {
      if (_hadDentalProcedures == true) {
        _finishWithIneligibility(
          reasonAr: 'إجراء علاج للأسنان (خلع، تنظيف جير، حشو عصب) خلال الأسبوعين الماضيين يُدخل بكتيريا مؤقتة بمجرى الدم قد تضر المريض المنقول إليه الدم بشدة.',
          reasonEn: 'Recent dental interventions introduce transient bacteremia, creating critical infection risks for vulnerable recipients.',
          safeWaitAr: 'يرجى الانتظار من 7 إلى 14 يوماً من تاريخ آخر جلسة علاج أسنان.',
          safeWaitEn: 'Please wait 7 to 14 days following your last dental procedure.',
        );
        return;
      }
    } else if (_currentStep == 2) {
      if (_tookProhibitedMeds == true) {
        _finishWithIneligibility(
          reasonAr: 'تناول أدوية محظورة (مضاد حيوي في آخر 72 ساعة، روأكيوتان لحب الشباب في آخر شهر، أو أسبرين في آخر 48 ساعة) يؤثر مباشرة على جودة الدم ويمنع استخدامه طبياً.',
          reasonEn: 'Active antibiotics, isotretinoin (Roaccutane), or blood thinners (aspirin) degrade unit safety and can trigger teratogenic harm.',
          safeWaitAr: 'انتظر 3 أيام بعد المضاد الحيوي، أو 48 ساعة بعد الأسبرين، أو شهراً كاملاً بعد الروأكيوتان.',
          safeWaitEn: 'Wait 3 days post-antibiotic, 48h post-aspirin, or 30 days post-isotretinoin.',
        );
        return;
      }
    } else if (_currentStep == 3) {
      if (_hadTattooOrHijama == true) {
        _finishWithIneligibility(
          reasonAr: 'إجراء حجامة، وشم (Tattoo)، ثقب أذن، أو جراحة في آخر 12 شهراً يتطلب فترة أمان كاملة في مصر للتأكد التام من خلو الدم من أي فيروسات كبدية كامنة.',
          reasonEn: 'Hijama, tattoos, or surgical interventions require a strict 12-month deferral under Egyptian blood transfusion safety laws.',
          safeWaitAr: 'يلزم مرور سنة كاملة (12 شهراً) من تاريخ الإجراء.',
          safeWaitEn: 'A full 12-month window must elapse since the procedure.',
        );
        return;
      }
    } else if (_gender == 'female' && _currentStep == 4) {
      if (_isPregnantOrNursing == true) {
        _finishWithIneligibility(
          reasonAr: 'الحمل والرضاعة الطبيعية يمنعان التبرع بالدم لحماية صحة الأم وتغذية الطفل ومنع الإصابة بأنيميا نقص الحديد الحادة.',
          reasonEn: 'Pregnancy and breastfeeding strictly preclude blood donation to preserve maternal-child iron homeostasis.',
          safeWaitAr: 'يمكن التبرع بعد مرور 6 أشهر على الأقل من الولادة أو انتهاء فترة الرضاعة.',
          safeWaitEn: 'Eligible 6 months following delivery or weaning.',
        );
        return;
      }
    }

    // Advance to next step or finish
    if (_currentStep < _totalSteps - 1) {
      setState(() {
        _currentStep++;
      });
    } else {
      // Final step evaluation
      if (_hemoglobinStatus == 'low' || _feelingHealthyToday == false) {
        _finishWithIneligibility(
          reasonAr: 'الشعور بالإرهاق أو وجود فقر دم معروف يمنع التبرع حفاظاً على صحتك ومناعتك.',
          reasonEn: 'Fatigue or active anemia disqualifies donation for donor health preservation.',
          safeWaitAr: 'احرص على الراحة التامة والتغذية السليمة واستشارة الطبيب.',
          safeWaitEn: 'Rest well and consult a healthcare provider.',
        );
      } else {
        setState(() {
          _quizFinished = true;
          _isEligible = true;
        });
      }
    }
  }

  void _finishWithIneligibility({
    required String reasonAr,
    required String reasonEn,
    required String safeWaitAr,
    required String safeWaitEn,
  }) {
    setState(() {
      _quizFinished = true;
      _isEligible = false;
      _disqualificationReasonAr = reasonAr;
      _disqualificationReasonEn = reasonEn;
      _recommendedSafeWaitAr = safeWaitAr;
      _recommendedSafeWaitEn = safeWaitEn;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: LifeLinkDetailAppBar(
        title: isAr ? 'فحص الأهلية الطبي للتبرع' : 'Medical Screening Quiz',
      ),
      body: SafeArea(
        child: _quizFinished ? _buildResultView(isAr) : _buildQuizView(isAr),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // QUIZ VIEW (Interactive Step Flow)
  // ─────────────────────────────────────────────────────────────
  Widget _buildQuizView(bool isAr) {
    final progress = (_currentStep + 1) / _totalSteps;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Progress Bar & Step Label
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isAr
                    ? 'السؤال ${_currentStep + 1} من $_totalSteps'
                    : 'Question ${_currentStep + 1} of $_totalSteps',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  fontFamily: 'Cairo',
                ),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: AppRadii.full,
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.surfaceVariant,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Animated Step Card
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _buildCurrentQuestion(isAr),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentQuestion(bool isAr) {
    switch (_currentStep) {
      case 0:
        return _buildStepGenderAndWeight(isAr);
      case 1:
        return _buildStepDental(isAr);
      case 2:
        return _buildStepMeds(isAr);
      case 3:
        return _buildStepTattooAndHijama(isAr);
      case 4:
        if (_gender == 'female') {
          return _buildStepFemaleSpecific(isAr);
        } else {
          return _buildStepHemoglobinAndHealth(isAr);
        }
      case 5:
        return _buildStepHemoglobinAndHealth(isAr);
      default:
        return const SizedBox.shrink();
    }
  }

  // Step 0: Gender & Weight
  Widget _buildStepGenderAndWeight(bool isAr) {
    return Column(
      key: const ValueKey<int>(0),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr ? '1. تأكيد النوع (الجندر):' : '1. Confirm Gender:',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'ذكر' : 'Male',
                      icon: Icons.male_rounded,
                      isSelected: _gender == 'male',
                      onTap: () => setState(() {
                        _gender = 'male';
                        _isAgeEligible = null;
                      }),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'أنثى' : 'Female',
                      icon: Icons.female_rounded,
                      isSelected: _gender == 'female',
                      onTap: () => setState(() {
                        _gender = 'female';
                        _isAgeEligible = null;
                      }),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isAr ? '2. هل وزنك 60 كجم أو أكثر؟' : '2. Is your weight 60 kg or above?',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم (60 كجم فأكثر)' : 'Yes (60+ kg)',
                      icon: Icons.check_circle_outline,
                      isSelected: _isWeightAbove60 == true,
                      onTap: () => setState(() => _isWeightAbove60 = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'لا (أقل من 60)' : 'No (< 60 kg)',
                      icon: Icons.cancel_outlined,
                      isSelected: _isWeightAbove60 == false,
                      onTap: () => setState(() => _isWeightAbove60 = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'في مصر، سحب وحدة دم (نصف لتر مع أنابيب الفحص) من شخص وزنه أقل من 60 كجم قد يسبب دوخة وهبوطاً حاداً في ضغط الدم. لذا تشترط الحملات الميدانية وبنوك الدم 60 كجم لحمايتك.'
                    : 'Extracting 500ml of blood from individuals under 60kg frequently induces hypotension and dizziness. Egyptian centers mandate 60kg for donor safety.',
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isAr
                    ? (_gender == 'female'
                        ? '3. هل عمرك بين 18 و 40 عاماً؟'
                        : '3. هل عمرك بين 18 و 60 عاماً؟')
                    : (_gender == 'female'
                        ? '3. Is your age between 18 and 40 years?'
                        : '3. Is your age between 18 and 60 years?'),
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isAr
                    ? (_gender == 'female'
                        ? '(في مصر: سن تبرع الإناث محدد بين 18 و 40 سنة فقط لحماية مخزون الحديد وصحة المرأة)'
                        : '(في مصر: سن تبرع الذكور مسموح به بين 18 و 60 سنة وفق المعايير القومية)')
                    : (_gender == 'female'
                        ? '(Egyptian banks cap female donation at 18-40 to preserve ferritin and prevent anemia)'
                        : '(Standard male donation age range in Egypt is 18 to 60)'),
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr
                          ? (_gender == 'female' ? 'نعم (18 - 40 سنة)' : 'نعم (18 - 60 سنة)')
                          : (_gender == 'female' ? 'Yes (18-40 yrs)' : 'Yes (18-60 yrs)'),
                      icon: Icons.cake_rounded,
                      isSelected: _isAgeEligible == true,
                      onTap: () => setState(() => _isAgeEligible = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr
                          ? (_gender == 'female' ? 'لا (فوق 40 أو تحت 18)' : 'لا (فوق 60 أو تحت 18)')
                          : (_gender == 'female' ? 'No (>40 or <18)' : 'No (>60 or <18)'),
                      icon: Icons.cancel_outlined,
                      isSelected: _isAgeEligible == false,
                      onTap: () => setState(() => _isAgeEligible = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? (_gender == 'female'
                        ? 'تمنع بنوك الدم والحملات في مصر تبرع السيدات فوق سن 40 لوقايتهن من استنزاف مخزون الحديد (Ferritin) وهشاشة العظام مع مرحلة ما قبل انقطاع الطمث.'
                        : 'النطاق العمري القياسي للمتبرعين الذكور هو 18 إلى 60 عاماً لضمان كفاءة الدورة الدموية وتحمل سحب وحدة الدم بأمان.')
                    : (_gender == 'female'
                        ? 'Egyptian blood banks defer female donation past 40 to prevent ferritin exhaustion and maintain bone density prior to perimenopause.'
                        : 'The standard age range for male donors in Egypt is 18 to 60 years to ensure circulatory safety.'),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'التالي' : 'Next',
          icon: Icons.arrow_forward_rounded,
          onPressed: (_isWeightAbove60 == null || _isAgeEligible == null) ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // Step 1: Dental Procedures
  Widget _buildStepDental(bool isAr) {
    return Column(
      key: const ValueKey<int>(1),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr
                    ? 'هل أجريت علاجاً للأسنان خلال آخر أسبوعين؟'
                    : 'Did you undergo dental work in the last 14 days?',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 6),
              Text(
                isAr
                    ? '(يشمل ذلك: خلع ضرس، حشو عصب، تنظيف جير عميق، أو جراحة لثة)'
                    : '(Includes: extractions, root canals, deep scaling, or gum surgery)',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontFamily: 'Cairo'),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم، أجريت' : 'Yes, I did',
                      icon: Icons.warning_amber_rounded,
                      isSelected: _hadDentalProcedures == true,
                      onTap: () => setState(() => _hadDentalProcedures = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'لا، لم أجرِ' : 'No, I did not',
                      icon: Icons.check_circle_outline,
                      isSelected: _hadDentalProcedures == false,
                      onTap: () => setState(() => _hadDentalProcedures = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'جراحات الأسنان تُحدث جروحاً دقيقة باللثة تُدخل بكتيريا مؤقتة لمجرى الدم (Transient Bacteremia). جسمك يتعامل معها بسهولة، لكنها قد تسبب عدوى وتسمماً دموياً خطيراً لمريض العناية المركزة أو الأطفال.'
                    : 'Dental interventions create micro-abrasions that release transient bacteremia into circulation. While harmless to healthy donors, it presents lethal septic risk to immunosuppressed recipients.',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'التالي' : 'Next',
          icon: Icons.arrow_forward_rounded,
          onPressed: _hadDentalProcedures == null ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // Step 2: Prohibited Meds
  Widget _buildStepMeds(bool isAr) {
    return Column(
      key: const ValueKey<int>(2),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr
                    ? 'هل تناولت أياً من هذه الأدوية مؤخراً؟'
                    : 'Did you take any of these medications recently?',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 6),
              Text(
                isAr
                    ? '• مضاد حيوي (في آخر 3 أيام)\n• روأكيوتان لحب الشباب / كوراكني (في آخر شهر)\n• أسبرين أو أدوية سيولة (في آخر 48 ساعة)'
                    : '• Antibiotics (last 3 days)\n• Roaccutane / Curacne (last month)\n• Aspirin / blood thinners (last 48 hours)',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.5, fontFamily: 'Cairo'),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم، تناولت' : 'Yes, I did',
                      icon: Icons.medication_outlined,
                      isSelected: _tookProhibitedMeds == true,
                      onTap: () => setState(() => _tookProhibitedMeds = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'لا، لم أتناول' : 'No, none of them',
                      icon: Icons.check_circle_outline,
                      isSelected: _tookProhibitedMeds == false,
                      onTap: () => setState(() => _tookProhibitedMeds = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'دواء حب الشباب (الروأكيوتان) يسبب تشوهات جنينية بالغة للمرأة الحامل إذا نقل لها الدم! والأسبرين يعطل كفاءة الصفائح الدموية، والمضادات الحيوية تعني وجود عدوى نشطة.'
                    : 'Isotretinoin causes devastating birth defects in pregnant recipients. Aspirin irreversibly disables platelets for 48 hours, rendering units ineffective.',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'التالي' : 'Next',
          icon: Icons.arrow_forward_rounded,
          onPressed: _tookProhibitedMeds == null ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // Step 3: Tattoo & Hijama
  Widget _buildStepTattooAndHijama(bool isAr) {
    return Column(
      key: const ValueKey<int>(3),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr
                    ? 'هل قمت بعمل حجامة، وشم (Tattoo)، أو خضعت لعملية جراحية خلال الـ 12 شهراً الماضية؟'
                    : 'Did you undergo Hijama, tattoos, piercings, or surgery in the last 12 months?',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم' : 'Yes',
                      icon: Icons.warning_amber_rounded,
                      isSelected: _hadTattooOrHijama == true,
                      onTap: () => setState(() => _hadTattooOrHijama = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'لا' : 'No',
                      icon: Icons.check_circle_outline,
                      isSelected: _hadTattooOrHijama == false,
                      onTap: () => setState(() => _hadTattooOrHijama = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'تشترط بنوك الدم المصرية سنة كاملة (12 شهراً) كفترة أمان وقائية، لتجاوز فترات الحضانة الطويلة لأي فيروسات قد تنتقل عبر وخز الإبر أو أدوات الجراحة.'
                    : 'Egyptian national guidelines require a 12-month deferral following any invasive skin procedure or surgery to ensure total clearance beyond viral diagnostic window periods.',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'التالي' : 'Next',
          icon: Icons.arrow_forward_rounded,
          onPressed: _hadTattooOrHijama == null ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // Step 4 (Female only): Pregnancy & Nursing
  Widget _buildStepFemaleSpecific(bool isAr) {
    return Column(
      key: const ValueKey<int>(4),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr
                    ? 'هل يوجد حمل حالياً، أو ولادة / رضاعة طبيعية خلال آخر 6 أشهر؟'
                    : 'Are you currently pregnant, or delivered / breastfed in the last 6 months?',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم' : 'Yes',
                      icon: Icons.pregnant_woman_rounded,
                      isSelected: _isPregnantOrNursing == true,
                      onTap: () => setState(() => _isPregnantOrNursing = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'لا' : 'No',
                      icon: Icons.check_circle_outline,
                      isSelected: _isPregnantOrNursing == false,
                      onTap: () => setState(() => _isPregnantOrNursing = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'حفاظاً على مخزون الحديد في جسم الأم وتغذية الطفل، يُحظر التبرع أثناء الحمل وحتى مرور 6 أشهر على الأقل بعد الولادة أو انتهاء الرضاعة الطبيعية.'
                    : 'To prevent severe maternal iron deficiency and support infant nutrition, donation is deferred during pregnancy and for 6 months post-delivery/lactation.',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'التالي' : 'Next',
          icon: Icons.arrow_forward_rounded,
          onPressed: _isPregnantOrNursing == null ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // Final Step: Hemoglobin & Health
  Widget _buildStepHemoglobinAndHealth(bool isAr) {
    return Column(
      key: const ValueKey<int>(5),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAr
                    ? '1. هل تشعر بصحة جيدة ونشاط اليوم؟'
                    : '1. Are you feeling well and energetic today?',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'نعم، بصحة جيدة' : 'Yes, feeling well',
                      icon: Icons.sentiment_very_satisfied_rounded,
                      isSelected: _feelingHealthyToday == true,
                      onTap: () => setState(() => _feelingHealthyToday = true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildChoiceButton(
                      label: isAr ? 'أشعر بإرهاق / دوخة' : 'Feeling fatigued',
                      icon: Icons.sentiment_dissatisfied_rounded,
                      isSelected: _feelingHealthyToday == false,
                      onTap: () => setState(() => _feelingHealthyToday = false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isAr
                    ? '2. مستوى الهيموجلوبين التقريبي:'
                    : '2. Approximate Hemoglobin level:',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Column(
                children: [
                  _buildRadioOption(
                    title: isAr
                        ? 'طبيعي ومناسب (فوق 13 للرجال، وفوق 12.5 للسيدات)'
                        : 'Normal (>13 for men, >12.5 for women)',
                    isSelected: _hemoglobinStatus == 'normal',
                    onTap: () => setState(() => _hemoglobinStatus = 'normal'),
                  ),
                  const SizedBox(height: 8),
                  _buildRadioOption(
                    title: isAr
                        ? 'لا أعلم / سيتم الفحص السريع ببنك الدم (خيار معتمد)'
                        : 'I don\'t know / will be tested on-site at blood bank',
                    isSelected: _hemoglobinStatus == 'unknown',
                    badge: isAr ? 'الأكثر شيوعاً' : 'Most common',
                    onTap: () => setState(() => _hemoglobinStatus = 'unknown'),
                  ),
                  const SizedBox(height: 8),
                  _buildRadioOption(
                    title: isAr
                        ? 'أعاني من أنيميا مؤكدة حالياً'
                        : 'I currently have confirmed anemia',
                    isSelected: _hemoglobinStatus == 'low',
                    onTap: () => setState(() => _hemoglobinStatus = 'low'),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildMedicalRationale(
                isAr: isAr,
                reason: isAr
                    ? 'إذا كنت لا تعرف نسبة الهيموجلوبين لا تقلق! يقوم طبيب بنك الدم بتحليل شكة إصبع فوري مجاني (جهاز الهيموكيو) قبل التبرع للتأكد من نسبتك خلال دقيقة واحدة.'
                    : 'If you don\'t know your hemoglobin level, don\'t worry! The blood bank performs an instant finger-prick test prior to donation to verify your suitability within 60 seconds.',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        LifeLinkButton(
          label: isAr ? 'عرض النتيجة الطبية' : 'View Screening Result',
          icon: Icons.fact_check_outlined,
          onPressed: _feelingHealthyToday == null ? null : _evaluateAndNext,
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RESULT VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildResultView(bool isAr) {
    if (_isEligible) {
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppColors.successLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.verified_rounded,
                  color: AppColors.success,
                  size: 64,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isAr ? 'أنت مؤهل طبياً للتبرع بالدم 🎉' : 'You are Medically Eligible! 🎉',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isAr
                    ? 'أنت مستوفٍ لكافة المعايير الطبية المبدئية المعتمدة في بنوك الدم المصرية. يتبقى فقط إحضار بطاقة الرقم القومي الأصلية وسيقوم طبيب بنك الدم بفحص النبض والضغط والهيموجلوبين السريع.'
                    : 'You satisfy all primary Egyptian blood donation standards. Remember to bring your physical National ID card for on-site vitals verification.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.5,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              LifeLinkButton(
                label: isAr ? 'المتابعة لتأكيد التبرع الآن' : 'Proceed to Confirm Donation',
                icon: Icons.check_circle_rounded,
                onPressed: () {
                  if (widget.onEligibleProceed != null) {
                    widget.onEligibleProceed!();
                  } else {
                    context.pop(true);
                  }
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => context.push('/donor/guide'),
                icon: const Icon(Icons.menu_book_rounded, size: 18),
                label: Text(
                  isAr ? 'عرض إرشادات وتغذية ما قبل التبرع' : 'View Nutrition & Prep Guidelines',
                  style: const TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      );
    } else {
      // Ineligible / Temporary Deferral
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.hourglass_top_rounded,
                  color: AppColors.warning,
                  size: 64,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isAr ? 'للأسف، لا يمكنك التبرع حالياً' : 'Donation Temporarily Deferred',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppColors.warning,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: AppRadii.md,
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.error, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAr ? _disqualificationReasonAr : _disqualificationReasonEn,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textPrimary,
                              height: 1.45,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.calendar_today_outlined, color: AppColors.secondaryBlue, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isAr
                                ? 'موعد العودة الآمن: $_recommendedSafeWaitAr'
                                : 'Safe return window: $_recommendedSafeWaitEn',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.secondaryBlue,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              LifeLinkButton(
                label: isAr ? 'عرض دليل ومعايير التبرع الكامل' : 'View Complete Donation Guide',
                icon: Icons.menu_book_rounded,
                onPressed: () => context.push('/donor/guide'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.pop(false),
                child: Text(
                  isAr ? 'العودة للرئيسية' : 'Return to Home',
                  style: const TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helper Widgets
  // ─────────────────────────────────────────────────────────────
  Widget _buildChoiceButton({
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surfaceVariant.withValues(alpha: 0.6),
          borderRadius: AppRadii.md,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'Cairo',
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioOption({
    required String title,
    required bool isSelected,
    String? badge,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : AppColors.surface,
          borderRadius: AppRadii.md,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_off,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 6),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: const BoxDecoration(
                  color: AppColors.successLight,
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMedicalRationale({required bool isAr, required String reason}) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant.withValues(alpha: 0.6),
        borderRadius: AppRadii.sm,
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.secondaryBlue),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '${isAr ? "السبب الطبي التوعوي: " : "Medical Rationale: "}$reason',
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.textSecondary,
                height: 1.4,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
