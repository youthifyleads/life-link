import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 40.0;
}

class AppRadii {
  AppRadii._();

  static const BorderRadius xs = BorderRadius.all(Radius.circular(4.0));
  static const BorderRadius sm = BorderRadius.all(Radius.circular(8.0));
  static const BorderRadius md = BorderRadius.all(Radius.circular(12.0));
  static const BorderRadius lg = BorderRadius.all(Radius.circular(16.0));
  static const BorderRadius xl = BorderRadius.all(Radius.circular(24.0));
  static const BorderRadius full = BorderRadius.all(Radius.circular(999.0));
}

class AppShadows {
  AppShadows._();

  static const List<BoxShadow> soft = [
    BoxShadow(
      color: Color(0x0F000000),
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];
}
