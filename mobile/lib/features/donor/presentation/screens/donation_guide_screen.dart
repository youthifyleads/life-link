import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/widgets/lifelink_app_bar.dart';
import '../../../../core/widgets/lifelink_card.dart';
import '../../../../core/localization/localization_extension.dart';

class DonationGuideScreen extends StatefulWidget {
  const DonationGuideScreen({super.key});

  @override
  State<DonationGuideScreen> createState() => _DonationGuideScreenState();
}

class _DonationGuideScreenState extends State<DonationGuideScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedDeferralFilterIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isAr = context.isArabic;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: LifeLinkDetailAppBar(
        title: isAr ? 'دليل وكتالوج التبرع بالدم' : 'Blood Donation Guide',
      ),
      body: Column(
        children: [
          // 1. Official Egyptian Accreditation Hero Header
          _OfficialHeaderBanner(isAr: isAr),

          // 2. Styled Tab Bar
          Container(
            color: AppColors.surface,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
              indicatorWeight: 3.5,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                fontFamily: 'Cairo',
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                fontFamily: 'Cairo',
              ),
              tabs: [
                Tab(
                  icon: const Icon(Icons.verified_rounded, size: 19),
                  text: isAr ? 'المعايير المصرية' : 'Standards',
                ),
                Tab(
                  icon: const Icon(Icons.timer_outlined, size: 19),
                  text: isAr ? 'فترات الحظر والأسباب' : 'Deferral Rules',
                ),
                Tab(
                  icon: const Icon(Icons.restaurant_menu_rounded, size: 19),
                  text: isAr ? 'دليل التغذية' : 'Nutrition Guide',
                ),
                Tab(
                  icon: const Icon(Icons.quiz_outlined, size: 19),
                  text: isAr ? 'الأسئلة الشائعة' : 'FAQ',
                ),
              ],
            ),
          ),

          // 3. Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildStandardsTab(isAr),
                _buildDeferralRulesTab(isAr),
                _buildNutritionTab(isAr),
                _buildFaqTab(isAr),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. STANDARDS TAB (المعايير المصرية)
  // ─────────────────────────────────────────────────────────────
  Widget _buildStandardsTab(bool isAr) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Grid of 4 Key Egyptian Metrics
        Text(
          isAr ? 'الركائز الـ 4 الأساسية للمتبرع في مصر 🇪🇬' : 'The 4 Egyptian Core Criteria',
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: 2),
        Text(
          isAr
              ? 'معايير ملزمة قانونياً بقرار وزارة الصحة لحمايتك وحماية المريض'
              : 'Mandated by Egyptian Law No. 8 of 2021 for recipient & donor safety',
          style: const TextStyle(
            fontSize: 11.5,
            color: AppColors.textSecondary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // 2x2 Grid of Stat Cards
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                icon: Icons.badge_rounded,
                badge: isAr ? 'إلزامي قطعي' : 'Mandatory',
                badgeColor: AppColors.primary,
                title: isAr ? '14 رقماً' : '14 Digits',
                subtitle: isAr ? 'الرقم القومي الساري' : 'Valid National ID',
                description: isAr
                    ? 'أصل البطاقة شرط لقبول التبرع وربطه بالمنظومة وسرية التحاليل'
                    : 'Original ID required for national tracing & test privacy',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _MetricCard(
                icon: Icons.monitor_weight_rounded,
                badge: isAr ? 'الحد المعتمد' : 'Clinic Rule',
                badgeColor: AppColors.secondaryBlue,
                title: isAr ? '60+ كجم' : '60+ kg',
                subtitle: isAr ? 'الوزن الآمن عملياً' : 'Safe Body Weight',
                description: isAr
                    ? 'لتجنب هبوط الضغط والدوخة بعد سحب 500 مل (دم وعينات)'
                    : 'Prevents syncope and dizziness during 500ml total extraction',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                icon: Icons.wc_rounded,
                badge: isAr ? 'بحسب النوع' : 'By Gender',
                badgeColor: AppColors.teal,
                title: isAr ? 'ذكور 18-60 • إناث 18-40' : 'Men 18-60 • Women 18-40',
                subtitle: isAr ? 'السن المسموح به طبياً' : 'Eligible Age by Gender',
                description: isAr
                    ? 'للذكور حتى 60 سنة، بينما يُمنع تبرع الإناث فوق سن الـ 40 لحماية مخزون الحديد وصحة العظام'
                    : 'Men up to 60 yrs; women deferred after 40 to safeguard ferritin & bone density',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _MetricCard(
                icon: Icons.biotech_rounded,
                badge: isAr ? 'مجاني 100%' : '100% Free',
                badgeColor: AppColors.purple,
                title: isAr ? 'فحص رباعي' : '4 Tests',
                subtitle: isAr ? 'تحاليل فيروسية سرية' : 'Confidential Lab',
                description: isAr
                    ? 'فحص فيروس B، C، نقص المناعة HIV، والزهري بدقة معملية تامة'
                    : 'Confidential testing for Hep B, C, HIV, and Syphilis',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),

        // Section 2: Clinical Vitals
        Text(
          isAr ? 'الفحوصات السريرية والضوابط الطبية' : 'Clinical Vitals & Medical Rules',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        _ClinicalCheckCard(
          icon: Icons.wc_rounded,
          color: AppColors.teal,
          title: isAr ? 'اختلاف السن المسموح بين الذكر والأنثى' : 'Age Limit: Men vs Women',
          detail: isAr
              ? '• للذكور: من 18 إلى 60 سنة (وحتى 65 للمتبرع المنتظم).\n• للإناث: من 18 إلى 40 سنة فقط؛ حيث يُمنع التبرع للسيدات اللاتي تجاوزن سن الـ 40 عاماً في بنوك الدم والحملات المصرية، حفاظاً على صحة المرأة ومخزون الحديد (Ferritin) وكثافة العظام ومرحلة ما قبل انقطاع الطمث.'
              : '• Men: 18 to 60 years (up to 65 for regular donors).\n• Women: 18 to 40 years only. Women over 40 are deferred under Egyptian clinical protocols to protect ferritin reserves and bone density.',
        ),
        const SizedBox(height: AppSpacing.sm),
        _ClinicalCheckCard(
          icon: Icons.favorite_rounded,
          color: AppColors.primary,
          title: isAr ? 'ضغط الدم والنبض' : 'Blood Pressure & Pulse',
          detail: isAr
              ? 'الضغط الطبيعي المطلوب بين 100/60 إلى 140/90 مم زئبق. والنبض المنتظم بين 60 إلى 100 نبضة بالدقيقة دون اضطراب.'
              : 'Blood pressure must be between 100/60 and 140/90 mmHg. Pulse must be rhythmic, 60-100 bpm.',
        ),
        const SizedBox(height: AppSpacing.sm),
        _ClinicalCheckCard(
          icon: Icons.water_drop_rounded,
          color: AppColors.secondaryBlue,
          title: isAr ? 'نسبة الهيموجلوبين (فحص وخزة الإصبع)' : 'Hemoglobin Level (Fingerprick Test)',
          detail: isAr
              ? 'للرجال: لا يقل عن 13 جم/دل.\nللإناث: لا يقل عن 12.5 جم/دل.\nيتم الفحص فورياً في دقيقة واحدة للتأكد من عدم وجود أنيميا.'
              : 'Men: ≥ 13 g/dL | Women: ≥ 12.5 g/dL. Fast 1-minute fingerprick check ensures zero anemia.',
        ),
        const SizedBox(height: AppSpacing.sm),
        _ClinicalCheckCard(
          icon: Icons.date_range_rounded,
          color: AppColors.amber,
          title: isAr ? 'المدة الزمنية بين كل تبرع وآخر' : 'Donation Intervals',
          detail: isAr
              ? 'التبرع بالدم الكامل: كل 3 أشهر للرجال (4 مرات سنوياً)، وكل 4 أشهر للإناث (3 مرات سنوياً).\nالتبرع بالصفائح الدموية: يمكن التبرع كل أسبوعين إلى شهر.'
              : 'Whole blood: Every 3 months for men, every 4 months for women. Platelet apheresis: Every 2 to 4 weeks.',
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DEFERRAL RULES TAB (فترات الحظر والأسباب الطبية)
  // ─────────────────────────────────────────────────────────────
  Widget _buildDeferralRulesTab(bool isAr) {
    final filterLabels = isAr
        ? ['الكل', 'جراحات وأسنان', 'أدوية', 'حجامة وتاتو', 'سيدات']
        : ['All', 'Surgery & Dental', 'Meds', 'Cupping & Tattoo', 'Women'];

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Intro Callout
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant.withValues(alpha: 0.5),
            borderRadius: AppRadii.md,
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.health_and_safety_rounded, color: AppColors.primary, size: 24),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  isAr
                      ? 'التأجيل الطبي ليس رفضاً لشخصك، بل هو إجراء وقائي مؤقت لحمايتك أو لحماية مريض ذي مناعة ضعيفة في العناية المركزة.'
                      : 'Medical deferral is a temporary safeguard to protect both your health and vulnerable recipients.',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.4,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(filterLabels.length, (index) {
              final isSelected = _selectedDeferralFilterIndex == index;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(filterLabels[index]),
                  selected: isSelected,
                  selectedColor: AppColors.primaryLight,
                  backgroundColor: AppColors.surface,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: isSelected ? AppColors.primary : AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.border,
                  ),
                  onSelected: (val) {
                    if (val) {
                      setState(() => _selectedDeferralFilterIndex = index);
                    }
                  },
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Filtered items
        if (_selectedDeferralFilterIndex == 0 || _selectedDeferralFilterIndex == 1) ...[
          _buildRichDeferralCard(
            category: isAr ? 'طب وجراحة الأسنان' : 'Dental Procedures',
            period: isAr ? '7 - 14 يوماً' : '7 - 14 days',
            periodColor: AppColors.amber,
            icon: Icons.medical_services_rounded,
            title: isAr ? 'خلع ضرس، تنظيف جير، أو حشو عصب' : 'Tooth Extraction, Scaling or Root Canal',
            procedureDesc: isAr
                ? 'أي تدخل علاجي أو جراحي بالأسنان يُحدث تهتكاً أو نزفاً باللثة.'
                : 'Any dental intervention causing gum bleeding or mucosa breach.',
            medicalRationale: isAr
                ? 'جروح اللثة تُدخل بكتيريا فموية طبيعية إلى مجرى الدم مؤقتاً (Transient Bacteremia). مناعة المتبرع تتغلب عليها دون أعراض، لكن نقلها لمريض سرطان أو عناية مركزة قد يسبب تسمماً دموياً أو التهاب شغاف القلب (Endocarditis).'
                : 'Introduces Transient Bacteremia into the bloodstream. Harmless to healthy donors, but potentially lethal to immunocompromised patients.',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRichDeferralCard(
            category: isAr ? 'جراحات ونقل دم' : 'Surgery & Transfusions',
            period: isAr ? 'سنة كاملة (12 شهراً)' : '12 months',
            periodColor: AppColors.error,
            icon: Icons.local_hospital_rounded,
            title: isAr ? 'العمليات الجراحية والمناظير ونقل دم سابق' : 'Major Surgeries, Endoscopy & Prior Transfusions',
            procedureDesc: isAr
                ? 'إجراء جراحة كبرى أو منظار هضمي أو تلقي أكياس دم أو بلازما.'
                : 'Major surgical interventions, endoscopy, or receiving blood products.',
            medicalRationale: isAr
                ? 'لضمان تعافي مخزون الحديد بالكامل واستبعاد أي عدوى كامنة من بيئة المستشفيات وتجاوز فترة الحضانة الطبية للفيروسات الكبدية.'
                : 'Ensures recovery of iron reserves and full passage beyond latent diagnostic window periods for viral pathogens.',
          ),
          const SizedBox(height: AppSpacing.md),
        ],

        if (_selectedDeferralFilterIndex == 0 || _selectedDeferralFilterIndex == 2) ...[
          _buildRichDeferralCard(
            category: isAr ? 'عقاقير طبية' : 'Medications',
            period: isAr ? 'شهر كامل (30 يوماً)' : '1 full month (30 days)',
            periodColor: AppColors.error,
            icon: Icons.medication_rounded,
            title: isAr ? 'أدوية حب الشباب (الروأكيوتان / Isotretinoin)' : 'Acne Medication (Roaccutane / Isotretinoin)',
            procedureDesc: isAr
                ? 'عقاقير الأيزوتريتينوين ومشتقات فيتامين (أ) المركزة لعلاج البشرة.'
                : 'Isotretinoin and potent synthetic vitamin A skin treatments.',
            medicalRationale: isAr
                ? 'هذا الدواء يُعد مشوهاً خطيراً للأجنة (Teratogenic). إذا تبرع الشخص ووصل دمه لسيدة حامل ولو بتركيزات ضئيلة، يؤدي فوراً إلى تشوهات خلقية كارثية للجنين.'
                : 'Isotretinoin is a proven severe teratogen. Even trace plasma levels transfused to a pregnant patient cause irreversible fetal deformities.',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRichDeferralCard(
            category: isAr ? 'عقاقير طبية' : 'Medications',
            period: isAr ? '3 أيام للمضاد و 48 ساعة للأسبرين' : '3d antibiotics, 48h aspirin',
            periodColor: AppColors.secondaryBlue,
            icon: Icons.healing_rounded,
            title: isAr ? 'المضادات الحيوية والأسبرين والمسكنات' : 'Antibiotics & Aspirin / NSAIDs',
            procedureDesc: isAr
                ? 'تناول أقراص أو حقن مضاد حيوي، أو مسكنات تحتوي على حمض الأسيتيل ساليسيليك.'
                : 'Course of antibiotics or regular aspirin / antiplatelet drugs.',
            medicalRationale: isAr
                ? 'المضاد الحيوي مؤشر على عدوى ميكروبية نشطة في دمك. أما الأسبرين فيعطل عمل الصفائح الدموية لمدة 48 ساعة، مما يجعل التبرع بالصفائح غير فعال للمرضى الذين ينزفون.'
                : 'Antibiotics indicate active infection. Aspirin irreversibly disables platelet aggregation for 48 hours, ruining platelet viability.',
          ),
          const SizedBox(height: AppSpacing.md),
        ],

        if (_selectedDeferralFilterIndex == 0 || _selectedDeferralFilterIndex == 3) ...[
          _buildRichDeferralCard(
            category: isAr ? 'إجراءات جلدية وإبر' : 'Skin & Needles',
            period: isAr ? 'سنة كاملة (12 شهراً)' : '1 full year',
            periodColor: AppColors.error,
            icon: Icons.access_time_filled_rounded,
            title: isAr ? 'الحجامة، الوشم (Tattoo)، وثقب الأذن' : 'Cupping (Hijama), Tattoos & Piercings',
            procedureDesc: isAr
                ? 'أي وخز للجلد بآلات حادة أو كؤوس حجامة دموية أو تاتو.'
                : 'Skin piercing, cosmetic tattooing, or bloodletting cupping.',
            medicalRationale: isAr
                ? 'تعتمد بنوك الدم المصرية نافذة أمان مدتها 12 شهراً للتأكد من تجاوز فترات الحضانة الفيروسية الصامتة (Diagnostic Window Period) للفيروسات الكبدية B و C لضمان أمان دم المتلقي.'
                : 'A 12-month deferral safely clears the diagnostic window period for blood-borne hepatitis infections from non-sterile tools.',
          ),
          const SizedBox(height: AppSpacing.md),
        ],

        if (_selectedDeferralFilterIndex == 0 || _selectedDeferralFilterIndex == 4) ...[
          _buildRichDeferralCard(
            category: isAr ? 'صحة المرأة والعمر' : 'Female Age Limit',
            period: isAr ? 'فوق 40 سنة (ممنوع بمصر)' : 'Age > 40 (Deferred)',
            periodColor: AppColors.error,
            icon: Icons.person_off_rounded,
            title: isAr ? 'تجاوز سن الأربعين للإناث (أكبر من 40 سنة)' : 'Females Above 40 Years Old',
            procedureDesc: isAr
                ? 'بلوغ السيدة سن الأربعين عاماً فأكثر.'
                : 'Female donors aged 40 or above.',
            medicalRationale: isAr
                ? 'تشترط بنوك الدم والحملات المصرية اقتصار تبرع الإناث حتى سن 40 عاماً (بخلاف الرجال حتى سن 60)؛ لحماية المرأة من الفقد الحاد لمخزون الحديد (Ferritin) وهشاشة العظام والتعب المزمن واضطرابات مرحلة ما قبل انقطاع الطمث.'
                : 'Egyptian blood banking guidelines cap female donation at age 40 (vs 60 for men) to protect female donors from acute ferritin depletion, osteopenia, and peri-menopausal anemia.',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRichDeferralCard(
            category: isAr ? 'صحة المرأة' : 'Women\'s Health',
            period: isAr ? 'أثناء الحمل + 6 أشهر بعد الولادة' : 'Pregnancy + 6 months postpartum',
            periodColor: AppColors.purple,
            icon: Icons.pregnant_woman_rounded,
            title: isAr ? 'الحمل والولادة والرضاعة الطبيعية' : 'Pregnancy, Delivery & Lactation',
            procedureDesc: isAr
                ? 'الحمل الحالي أو الرضاعة الطبيعية المستمرة أو حديثة الولادة.'
                : 'Current pregnancy or active lactation postpartum.',
            medicalRationale: isAr
                ? 'حماية كاملة للأم والجنين. جسم الأم يحتاج لكل جرام حديد وسوائل لبناء الجنين وإدرار اللبن، والتبرع قد يسبب لها أنيميا حادة وهبوطاً عاماً.'
                : 'Protects maternal iron reserves and fetal development. Donation risks acute maternal anemia and hypovolemia during lactation.',
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. NUTRITION GUIDE TAB (دليل التغذية والوجبات)
  // ─────────────────────────────────────────────────────────────
  Widget _buildNutritionTab(bool isAr) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Crucial Warning Banner: Lipemic Plasma
        _LipemicPlasmaWarningBanner(isAr: isAr),
        const SizedBox(height: AppSpacing.lg),

        // Timeline: Donor Preparation Journey
        Text(
          isAr ? 'الجدول الزمني للتحضير (قبل وبعد التبرع) ⏱️' : 'Donor Timeline (Before & After)',
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        _NutritionTimelineStep(
          icon: Icons.water_drop_rounded,
          iconColor: AppColors.secondaryBlue,
          stepNumber: '1',
          timeLabel: isAr ? 'قبل التبرع بـ 24 ساعة' : '24 Hours Before',
          title: isAr ? 'ترطيب الجسم والنوم العميق' : 'Hydration & Solid Rest',
          points: isAr
              ? [
                  'اشرب من 2 إلى 3 لترات من الماء والسوائل الطبيعية لزيادة حجم بلازما الدم وتسهيل تدفقه أثناء السحب.',
                  'احصل على قسط كافٍ من النوم (7 إلى 8 ساعات) لتفادي الإرهاق وانخفاض الضغط.',
                ]
              : [
                  'Drink 2-3 liters of water to boost circulating plasma volume and prevent post-donation hypotension.',
                  'Get 7-8 hours of uninterrupted rest to stabilize cardiovascular tone.',
                ],
        ),
        const SizedBox(height: AppSpacing.sm),

        _NutritionTimelineStep(
          icon: Icons.restaurant_rounded,
          iconColor: AppColors.teal,
          stepNumber: '2',
          timeLabel: isAr ? 'قبل التبرع بساعتين' : '2 Hours Before',
          title: isAr ? 'وجبة صحية خفيفة (خالية من الدهون)' : 'Light Non-Fat Balanced Meal',
          points: isAr
              ? [
                  'تناول وجبة خفيفة مثل: سندوتش جبن أبيض خفيف، خبز بلدي، بيض مسلوق، شوفان، أو موزة وتمر.',
                  'اشرب كوبين إضافيين من الماء أو عصير برتقال طبيعي.',
                  'تجنب الذهاب للتبرع على معدة فارغة تماماً (لتجنب الإغماء).',
                ]
              : [
                  'Eat a light meal (lean cheese, boiled egg, oats, banana, dates).',
                  'Drink 2 full glasses of water or natural fresh orange juice.',
                  'Never donate on an empty stomach to prevent hypoglycemic fainting.',
                ],
        ),
        const SizedBox(height: AppSpacing.sm),

        _NutritionTimelineStep(
          icon: Icons.chair_rounded,
          iconColor: AppColors.amber,
          stepNumber: '3',
          timeLabel: isAr ? 'أثناء وبعد التبرع فوراً' : 'During & Immediately After',
          title: isAr ? 'الاسترخاء وتعويض السكر والسوائل' : 'Replenish Glucose & Rest',
          points: isAr
              ? [
                  'ابقَ مستلقياً أو جالساً في كرسي التبرع لمدة 10 إلى 15 دقيقة بعد نزع الإبرة.',
                  'تناول علبة العصير والبسكويت المقدمة لك فوراً لرفع سكر الدم وتعويض السوائل.',
                  'امتنع عن التدخين لمدة ساعتين على الأقل (التدخين يقلل أكسجين المخ ويسبب إغماء فورياً).',
                ]
              : [
                  'Rest seated or reclining for 10-15 minutes after the needle is removed.',
                  'Drink the offered juice and biscuit immediately to restore blood glucose.',
                  'Strictly no smoking for at least 2 hours to avoid acute cerebral hypoxia.',
                ],
        ),
        const SizedBox(height: AppSpacing.sm),

        _NutritionTimelineStep(
          icon: Icons.fitness_center_rounded,
          iconColor: AppColors.purple,
          stepNumber: '4',
          timeLabel: isAr ? 'بقية اليوم والأيام التالية' : 'Rest of the Day & Following Days',
          title: isAr ? 'حماية الذراع وتعويض الحديد' : 'Protect Arm & Rebuild Iron',
          points: isAr
              ? [
                  'تجنب التمارين الرياضية العنيفة وحمل الأوزان الثقيلة بذراع التبرع طوال اليوم.',
                  'تناول أغذية غنية بالحديد (سبانخ، لحوم حمراء، كبدة، عدس، عسل أسود) لبناء كرات الدم الحمراء.',
                ]
              : [
                  'Avoid heavy lifting or strenuous arm workouts for the remainder of the day.',
                  'Consume iron-rich foods (spinach, lentils, lean meat, beets) to accelerate RBC regeneration.',
                ],
        ),
        const SizedBox(height: AppSpacing.xl),

        // Do's & Don'ts Comparison Section
        Text(
          isAr ? 'المسموح والممنوع غذائياً قبل التبرع 🥗' : 'Pre-Donation Food Do\'s & Don\'ts',
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Do's Card
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: AppColors.successLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 22),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    isAr ? 'أغذية ومشروبات مستحبة جداً ✅' : 'Highly Recommended Foods ✅',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildBulletItem(isAr ? 'الماء والعصائر الطبيعية (برتقال، رمان، جوافة).' : 'Water and fresh vitamin C fruit juices.'),
              _buildBulletItem(isAr ? 'التمر والموز (سكريات طبيعية سريعة الامتصاص وبوتاسيوم).' : 'Dates and bananas for natural electrolytes and gentle glucose.'),
              _buildBulletItem(isAr ? 'الشوفان والخبز الأسمر والجبن قليل الدسم.' : 'Whole grains, oats, and low-fat dairy.'),
              _buildBulletItem(isAr ? 'البيض المسلوق ومصادر البروتين الخالية من الزيوت.' : 'Boiled eggs and oil-free lean proteins.'),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Don'ts Card
        LifeLinkCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: AppColors.errorLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.cancel_rounded, color: AppColors.error, size: 22),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    isAr ? 'أغذية وسلوكيات ممنوعة قبل التبرع ❌' : 'Strictly Avoid Before Donating ❌',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildBulletItem(isAr ? 'الفول بالسمنة والمقليات والفلافل المقلية والفاست فود.' : 'Fried meals, butter, oily Egyptian foul & greasy fast food.'),
              _buildBulletItem(isAr ? 'السجائر والشيشة قبل التبرع بساعتين (لأنها تخفض الأكسجين وتزيد أول أكسيد الكربون).' : 'Smoking 2 hours before/after donation.'),
              _buildBulletItem(isAr ? 'الإفراط في المنبهات والقهوة بدون ماء (مدرة للبول وتسبب الجفاف).' : 'Excessive black coffee without water (diuretic effect).'),
              _buildBulletItem(isAr ? 'الصيام الجاف (التبرع نهار رمضان دون شرب سوائل غير مسموح).' : 'Dry fasting without adequate hydration.'),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FAQ TAB (الأسئلة الشائعة)
  // ─────────────────────────────────────────────────────────────
  Widget _buildFaqTab(bool isAr) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        _buildAccordionFaq(
          icon: Icons.cake_rounded,
          iconColor: AppColors.primary,
          question: isAr
              ? 'لماذا يختلف السن المسموح بين الرجل والمرأة؟ وهل التبرع ممنوع للأنثى بعد سن الـ 40؟'
              : 'Why does eligible age differ between males and females? Is donation deferred for women over 40?',
          answer: isAr
              ? 'نعم، في بنوك الدم المصرية والحملات القومية، يُحدد سن التبرع للإناث بين 18 و 40 سنة فقط (بينما يمتد للذكور حتى 60 سنة). يعود ذلك لعدة أسباب وقائية وصحية:\n'
                '1. حماية مخزون الحديد والفيريتين (Ferritin) لدى المرأة نظراً للفقدان الشهري الدوري، مما يرفع خطر الإصابة بفقر الدم.\n'
                '2. تفادي التغيرات الهرمونية المصاحبة لمرحلة ما قبل انقطاع الطمث (Perimenopause) للحفاظ على كثافة العظام وتجنب الإجهاد الحاد.\n'
                '3. القاعدة الطبية الوطنية الصارمة: سلامة وصحة المتبرعة تسبق دائماً الحاجة لنقل الدم.'
              : 'Yes, Egyptian national blood banking standards cap female donation at age 40 (18-40 years), while male donors qualify up to 60 years. This preventive clinical policy protects maternal iron/ferritin stores from depletion, shields bone density, and avoids anemia onset during perimenopause.',
        ),
        _buildAccordionFaq(
          icon: Icons.smoke_free_rounded,
          iconColor: AppColors.error,
          question: isAr ? 'هل التدخين يمنع التبرع بالدم؟' : 'Does smoking disqualify you from donating?',
          answer: isAr
              ? 'التدخين لا يمنع التبرع بالدم نهائياً، ولكن يُشترط الامتناع التام عن التدخين لمدة ساعتين قبل التبرع وساعتين بعده. السبب هو تفادي زيادة غاز أول أكسيد الكربون في الدم ومنع الشعور بالدوخة أو الهبوط الحاد في ضغط الدم.'
              : 'Smoking does not disqualify you. However, you must stop 2 hours before and 2 hours after to prevent carbon monoxide spikes and cerebral hypoperfusion.',
        ),
        _buildAccordionFaq(
          icon: Icons.access_time_rounded,
          iconColor: AppColors.amber,
          question: isAr ? 'هل الوشم (Tattoo) أو الحجامة تمنع التبرع للأبد؟' : 'Do tattoos or Hijama permanently ban donation?',
          answer: isAr
              ? 'لا تمنع نهائياً، ولكنها تؤجل التبرع لمدة سنة كاملة (12 شهراً) في بنوك الدم المصرية، للتأكد التام من خلو الدم وتجاوز فترة الحضانة الصامتة لأي فيروسات قد تنتقل بالوخز غير المعقم.'
              : 'Not permanently. A 12-month deferral applies in Egypt to safely pass beyond latent viral incubation periods.',
        ),
        _buildAccordionFaq(
          icon: Icons.monitor_heart_rounded,
          iconColor: AppColors.secondaryBlue,
          question: isAr ? 'هل مريض الضغط أو السكر يمكنه التبرع؟' : 'Can hypertension or diabetes patients donate?',
          answer: isAr
              ? 'مريض الضغط: يمكنه التبرع إذا كان الضغط منضبطاً وقت الفحص (أقل من 140/90) ويتناول أدوية روتينية عادية.\nمريض السكر: إذا كان يعتمد على أقراص والتحليل منضبط فيمكن التبرع بعد استشارة طبيب البنك. أما المعتمد على الأنسولين فهو ممنوع تماماً لحماية صحته.'
              : 'Hypertensive donors qualify if BP is controlled (<140/90) on regular oral drugs. Diabetics on oral pills may donate upon MD check; insulin-dependent patients are deferred.',
        ),
        _buildAccordionFaq(
          icon: Icons.shield_rounded,
          iconColor: AppColors.teal,
          question: isAr ? 'هل التبرع يسبب أنيميا أو يضعف مناعة الجسم؟' : 'Does donation cause anemia or lower immunity?',
          answer: isAr
              ? 'إطلاقاً! وحدة الدم المسحوبة (450 مل) تمثل أقل من 8% من إجمالي دم الشخص البالغ. يقوم نخاع العظم بتعويض السوائل والبلازما في 24-48 ساعة، وتعويض كرات الدم الحمراء في أسابيع قليلة، مما ينشط الدورة الدموية ويجدد حيوية الخلايا.'
              : 'No! The 450ml drawn represents less than 8% of total blood volume. Plasma replenishes in 24-48 hours, and marrow is stimulated to generate fresh erythrocytes.',
        ),
        _buildAccordionFaq(
          icon: Icons.lock_outline_rounded,
          iconColor: AppColors.purple,
          question: isAr ? 'هل نتائج التحاليل الفيروسية سرية وكيف أعرفها؟' : 'Are viral test results confidential?',
          answer: isAr
              ? 'نعم، سرية بنسبة 100% طبقاً للقانون رقم 8 لسنة 2021. يتم ربط الكيس بكود رقمي مشفر برقمك القومي. في حال وجود أي ملاحظة إيجابية، يتم إخطارك شخصياً وبسرية تامة وتوجيهك للمتابعة الطبية المجانية في مراكز الكبد التابعة لوزارة الصحة.'
              : '100% confidential under Egyptian Law No. 8 of 2021. Blood bags are tracked by encrypted barcodes tied to your National ID. Any abnormal findings trigger confidential personal guidance.',
        ),
        _buildAccordionFaq(
          icon: Icons.wb_sunny_rounded,
          iconColor: AppColors.amber,
          question: isAr ? 'هل يجوز التبرع بالدم أثناء الصيام في رمضان؟' : 'Can I donate while dry fasting in Ramadan?',
          answer: isAr
              ? 'يُنصح بشدة بعدم التبرع أثناء ساعات الصيام الجاف لتجنب الجفاف وهبوط ضغط الدم الحاد والإغماء. أفضل وقت للتبرع في رمضان هو بعد الإفطار بساعتين إلى 3 ساعات مع الإكثار من الماء والسوائل.'
              : 'Dry fasting donation is strictly discouraged due to dehydration and syncope risks. Donate 2-3 hours post-Iftar with plentiful hydration.',
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Helper Widgets
  // ─────────────────────────────────────────────────────────────
  Widget _buildRichDeferralCard({
    required String category,
    required String period,
    required Color periodColor,
    required IconData icon,
    required String title,
    required String procedureDesc,
    required String medicalRationale,
  }) {
    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Category + Period Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: periodColor.withValues(alpha: 0.12),
                      borderRadius: AppRadii.sm,
                    ),
                    child: Icon(icon, color: periodColor, size: 18),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    category,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: periodColor.withValues(alpha: 0.12),
                  borderRadius: AppRadii.full,
                  border: Border.all(color: periodColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  period,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: periodColor,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Title & Description
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: 3),
          Text(
            procedureDesc,
            style: const TextStyle(
              fontSize: 11.5,
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Scientific Rationale Box
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm + 2),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant.withValues(alpha: 0.6),
              borderRadius: AppRadii.sm,
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.biotech_rounded,
                  size: 16,
                  color: AppColors.secondaryBlue,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'السبب الطبي العلمي لحماية المتلقي:',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.secondaryBlue,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        medicalRationale,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: AppColors.textSecondary,
                          height: 1.45,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccordionFaq({
    required IconData icon,
    required Color iconColor,
    required String question,
    required String answer,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.soft,
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 2),
          leading: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: AppRadii.sm,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          title: Text(
            question,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              fontFamily: 'Cairo',
            ),
          ),
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm + 2),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant.withValues(alpha: 0.4),
                  borderRadius: AppRadii.sm,
                ),
                child: Text(
                  answer,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.5,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBulletItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12,
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

// ─────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────

class _OfficialHeaderBanner extends StatelessWidget {
  final bool isAr;
  const _OfficialHeaderBanner({required this.isAr});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: AppRadii.md,
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
            ),
            child: const Icon(
              Icons.menu_book_rounded,
              color: AppColors.primary,
              size: 26,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr
                      ? 'الدليل القومي المعتمد لبنوك الدم'
                      : 'Egyptian Blood Banking Standards',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                    fontFamily: 'Cairo',
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  isAr
                      ? 'وفقاً لأحكام القانون رقم 8 لسنة 2021 والبروتوكولات المعملية لوزارة الصحة'
                      : 'Compliant with Egyptian Law No. 8 of 2021 & MOH Protocols',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String badge;
  final Color badgeColor;
  final String title;
  final String subtitle;
  final String description;

  const _MetricCard({
    required this.icon,
    required this.badge,
    required this.badgeColor,
    required this.title,
    required this.subtitle,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.soft,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.12),
                  borderRadius: AppRadii.sm,
                ),
                child: Icon(icon, color: badgeColor, size: 18),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.12),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    color: badgeColor,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: badgeColor,
              fontFamily: 'Cairo',
              height: 1.1,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.textSecondary,
              height: 1.35,
              fontFamily: 'Cairo',
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _ClinicalCheckCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String detail;

  const _ClinicalCheckCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.detail,
  });

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    fontFamily: 'Cairo',
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  detail,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondary,
                    height: 1.45,
                    fontFamily: 'Cairo',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LipemicPlasmaWarningBanner extends StatelessWidget {
  final bool isAr;
  const _LipemicPlasmaWarningBanner({required this.isAr});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2),
        borderRadius: AppRadii.md,
        border: Border.all(color: const Color(0xFFFDA4AF)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: AppColors.error,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr
                      ? '⚠️ تحذير طبي مصري حاسم: تجنب الدهون قبل التبرع!'
                      : '⚠️ Crucial Medical Warning: Zero Fatty Foods!',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: AppColors.error,
                    fontFamily: 'Cairo',
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isAr
                      ? 'تناول الوجبات الدسمة (مثل الفول بالسمنة والمقليات والشاورما) يفرز دهوناً تجعل بلازما الدم عكرة دهنياً (Lipemic Plasma). هذا يؤدي فوراً إلى فشل أجهزة المعمل في فحص الفيروسات وإعدام كيس الدم بالكامل ويضيع تبرعك هدراً!'
                      : 'Consuming high-fat meals causes lipemic cloudy plasma. Central laboratory optical analyzers cannot read viral tests accurately, resulting in discarding the entire unit!',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFF881337),
                    height: 1.45,
                    fontFamily: 'Cairo',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NutritionTimelineStep extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String stepNumber;
  final String timeLabel;
  final String title;
  final List<String> points;

  const _NutritionTimelineStep({
    required this.icon,
    required this.iconColor,
    required this.stepNumber,
    required this.timeLabel,
    required this.title,
    required this.points,
  });

  @override
  Widget build(BuildContext context) {
    return LifeLinkCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step Icon & Indicator
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(icon, color: iconColor, size: 20),
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  '#$stepNumber',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: iconColor,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: AppSpacing.md),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: const BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: AppRadii.sm,
                      ),
                      child: Text(
                        timeLabel,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ...points.map(
                  (pt) => Padding(
                    padding: const EdgeInsets.only(bottom: 3),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '• ',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            pt,
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
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
