import 'package:flutter/material.dart';

class AppSpacing {
  const AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 40;
}

class AppRadii {
  const AppRadii._();

  static const BorderRadius sm = BorderRadius.all(Radius.circular(8));
  static const BorderRadius md = BorderRadius.all(Radius.circular(12));
  static const BorderRadius lg = BorderRadius.all(Radius.circular(16));
  static const BorderRadius xl = BorderRadius.all(Radius.circular(20));

  static const BorderRadius borderSm = BorderRadius.all(Radius.circular(8));
  static const BorderRadius borderMd = BorderRadius.all(Radius.circular(12));
  static const BorderRadius borderLg = BorderRadius.all(Radius.circular(16));
  static const BorderRadius borderXl = BorderRadius.all(Radius.circular(20));
}

class AppShadows {
  const AppShadows._();

  static const List<BoxShadow> soft = [
    BoxShadow(
      color: Color(0x1A1F3C5B),
      blurRadius: 18,
      offset: Offset(0, 8),
    ),
  ];
}
