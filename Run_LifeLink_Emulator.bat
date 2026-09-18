@echo off
title LifeLink Android Emulator
echo ========================================================
echo       Launching LifeLink Virtual Phone (Pixel 6)
echo ========================================================
echo.
echo Starting Android Emulator...
start "" "%LOCALAPPDATA%\Android\sdk\emulator\emulator.exe" -avd LifeLink_Test

echo Waiting for emulator to start...
"%LOCALAPPDATA%\Android\sdk\platform-tools\adb.exe" wait-for-device

echo Device connected! Waiting for system to boot...
:wait_boot
for /f "tokens=*" %%a in ('"%LOCALAPPDATA%\Android\sdk\platform-tools\adb.exe" shell getprop sys.boot_completed 2^>nul') do set BOOTED=%%a
if not "%BOOTED%"=="1" (
    timeout /t 2 /nobreak >nul
    goto wait_boot
)

echo System booted successfully!
echo Launching LifeLink app...
timeout /t 2 /nobreak >nul
"%LOCALAPPDATA%\Android\sdk\platform-tools\adb.exe" shell monkey -p com.example.lifelink_mobile -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo ========================================================
echo    LifeLink is now running inside your Emulator!
echo ========================================================
timeout /t 4 >nul
