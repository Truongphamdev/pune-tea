@echo off
chcp 65001 >nul
title Puni Tea - chay website
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Chua co Node.js tren may nay.
  echo  Tai ban LTS tai https://nodejs.org , cai xong roi bam dup lai file nay.
  echo.
  pause
  exit /b 1
)

node scripts\chay-web.mjs %*
echo.
pause
