@echo off
title LifeLink Android Emulator
echo ====================================================
echo Cleaning any stale emulator locks...
if exist "G:\android_avd\LifeLink_Test\*.lock" del /f /q "G:\android_avd\LifeLink_Test\*.lock" 2>nul
if exist "G:\android_avd\LifeLink_Test\hardware-qemu.ini.lock" rmdir /s /q "G:\android_avd\LifeLink_Test\hardware-qemu.ini.lock" 2>nul
if exist "G:\android_avd\LifeLink_Test\multiinstance.lock" del /f /q "G:\android_avd\LifeLink_Test\multiinstance.lock" 2>nul
echo Starting LifeLink Android Emulator (LifeLink_Test)...
echo ====================================================
start "" "C:\Users\MSI\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd LifeLink_Test
