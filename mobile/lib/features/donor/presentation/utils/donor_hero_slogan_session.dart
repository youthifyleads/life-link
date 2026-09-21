class DonorHeroSloganSession {
  static int currentIndex = 0;
  static bool hasPickedForCurrentSession = false;

  /// Resets the session flag so that the next login advances to the next slogan.
  static void resetForNewLogin() {
    hasPickedForCurrentSession = false;
  }
}
