import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 20.0;
  static const double xl = 28.0;
  static const double xxl = 36.0;
}

class AppRadii {
  AppRadii._();

  static const BorderRadius xs = BorderRadius.all(Radius.circular(6.0));
  static const BorderRadius sm = BorderRadius.all(Radius.circular(10.0));
  static const BorderRadius md = BorderRadius.all(Radius.circular(14.0));
  static const BorderRadius lg = BorderRadius.all(Radius.circular(18.0));
  static const BorderRadius xl = BorderRadius.all(Radius.circular(24.0));
  static const BorderRadius full = BorderRadius.all(Radius.circular(999.0));
}

class AppShadows {
  AppShadows._();

  static const List<BoxShadow> soft = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x0C000000),
      blurRadius: 20,
      offset: Offset(0, 6),
    ),
  ];

  static const List<BoxShadow> elevated = [
    BoxShadow(
      color: Color(0x28E53935),
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];

  static const List<BoxShadow> bottomNav = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 24,
      offset: Offset(0, -4),
    ),
  ];
}
