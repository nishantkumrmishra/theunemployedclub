@echo off
title The Unemployed Club - Video Stream Extractor
cls
echo ======================================================================
echo           The Unemployed Club - Video Stream Extractor
echo ======================================================================
echo.

python "%~dp0main.py" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] An error occurred or Python was not found in PATH.
)

echo.
echo ======================================================================
echo Press any key to close this window...
pause >nul
