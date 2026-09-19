import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HelpScreen extends StatelessWidget {
  final String role;

  const HelpScreen({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    final isDonor = role == 'donor';
    final sections = isDonor
        ? const [
            (
              'استكمال الملف الشخصي',
              'سجّل رقم هاتفك وفصيلة دمك وحالة جاهزيتك للتبرع لتلقي الحالات المتوافقة.',
            ),
            (
              'التحقق الطبي من الفصيلة',
              'تعتمد منظومة LifeLink بيانات فصيلة الدم الموثقة لضمان أمان ومطابقة الحالات.',
            ),
            (
              'فترة الأمان الطبية (الأهلية)',
              'يجب انقضاء 6 أشهر (180 يوماً) على الأقل بعد آخر تبرع لضمان تعافي وصحة المتبرع.',
            ),
            (
              'متابعة طلبات التبرع العاجلة',
              'استعرض الحالات المتوافقة مع فصيلتك وأبْدِ استعدادك لإنقاذ حياة مريض.',
            ),
            (
              'قسائم التقدير والتحاليل',
              'بعد إتمام تبرعك في بنك الدم، تحصل فوراً على قسائم تقدير ومكافآت تحاليل مجانية.',
            ),
          ]
        : const [
            (
              'إضافة المريض وربطه بالمستشفى',
              'أضف بيانات المريض التابع لك مع كود المستشفى أو رقم الملف الطبي.',
            ),
            (
              'مسح كود طلب المستشفى (QR)',
              'يقوم طبيب المستشفى بإنشاء طلب الدم رسمياً، ويقوم المرافق بمسح رمز الاستجابة السريع للطلب من شاشة أو ورقة المستشفى.',
            ),
            (
              'مطابقة بنك الدم والأكياس',
              'يقوم النظام بالبحث الآلي في مخزون بنوك الدم المعتمدة والمتبرعين المتطابقين.',
            ),
            (
              'سداد الرسوم وتأكيد الطلب',
              'سداد الفاتورة المعتمدة بأمان عبر البطاقات البنكية، المحافظ الإلكترونية، أو خزينة المستشفى.',
            ),
            (
              'تتبع النقل الطبي المتخصص (Cold-Chain)',
              'ينقل مندوب طبي معتمد كيس الدم في حاوية مبردة ومراقبة حرارياً حتى باب المستشفى مباشرة، مع إمكانية التتبع اللحظي.',
            ),
          ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('دليل استخدام LifeLink'),
        leading: IconButton(
          icon: Icon(Icons.adaptive.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: sections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final section = sections[index];
          return Card(
            child: ListTile(
              leading: CircleAvatar(child: Text('${index + 1}')),
              title: Text(section.$1,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(section.$2),
            ),
          );
        },
      ),
    );
  }
}
