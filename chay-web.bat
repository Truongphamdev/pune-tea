@echo off
setlocal
chcp 65001 >nul
title Puni Tea - chay website
cd /d "%~dp0"

rem ---------------------------------------------------------------------------
rem  Chay website Puni Tea tren Windows: chi can BAM DUP file nay.
rem  Tu lam het: tai Node.js (neu may chua co), cai thu vien, build, chay web,
rem  tao tai khoan quan tri va mo trinh duyet. Khong can cai gi truoc.
rem ---------------------------------------------------------------------------

set "NODE_VERSION=22.23.3"
set "NODE_NAME=node-v%NODE_VERSION%-win-x64"
set "NODE_SHA=2b0ff57b049cda1bbcea2240eec20467018713c1efe1f7360c2681859b90ed71"
set "NODE_HOME=%~dp0.node\%NODE_NAME%"
set "NODE_ZIP=%~dp0.node\%NODE_NAME%.zip"

if exist "scripts\chay-web.mjs" goto :check_node
echo.
echo  KHONG TIM THAY CAC FILE CUA WEBSITE.
echo.
echo  Ban dang mo file nay tu BEN TRONG file nen (.zip / .rar).
echo  Hay lam nhu sau:
echo    1. Dong cua so nay va dong chuong trinh giai nen.
echo    2. Bam chuot phai vao file nen, chon "Extract Here" (Giai nen tai day).
echo    3. Mo thu muc vua giai nen ra, roi bam dup lai file chay-web.bat.
echo.
pause
exit /b 1

:check_node
rem Uu tien ban Node.js da tai san trong thu muc .node cua du an
if exist "%NODE_HOME%\node.exe" goto :use_local_node

rem May da cai Node.js du moi (tu 20.11) thi dung luon
where node >nul 2>nul
if errorlevel 1 goto :download_node
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&b>=11)?0:1)" >nul 2>nul
if errorlevel 1 goto :download_node
goto :run

:download_node
echo.
echo  May chua co Node.js phu hop - dang tai ve (khoang 35 MB, chi lam mot lan)...
echo  Ban tai ve nam trong thu muc du an, khong cai gi vao may.
echo.
if not exist "%~dp0.node" mkdir "%~dp0.node"

where curl >nul 2>nul
if errorlevel 1 goto :no_tools
where tar >nul 2>nul
if errorlevel 1 goto :no_tools

curl -L --fail --retry 3 -o "%NODE_ZIP%" "https://nodejs.org/dist/v%NODE_VERSION%/%NODE_NAME%.zip"
if errorlevel 1 goto :download_failed

rem Kiem tra file tai ve dung la ban Node.js chinh thuc (so khop ma SHA-256)
certutil -hashfile "%NODE_ZIP%" SHA256 | findstr /i /c:"%NODE_SHA%" >nul
if errorlevel 1 goto :hash_failed

echo  Dang giai nen Node.js...
tar -xf "%NODE_ZIP%" -C "%~dp0.node"
if errorlevel 1 goto :download_failed
del "%NODE_ZIP%" >nul 2>nul
if not exist "%NODE_HOME%\node.exe" goto :download_failed

:use_local_node
set "PATH=%NODE_HOME%;%PATH%"

:run
node scripts\chay-web.mjs %*
echo.
pause
exit /b 0

:no_tools
echo.
echo  May nay thieu cong cu tai file (Windows qua cu).
echo  Hay tu tai Node.js ban LTS tai https://nodejs.org , cai xong roi bam dup lai file nay.
echo.
pause
exit /b 1

:download_failed
del "%NODE_ZIP%" >nul 2>nul
echo.
echo  KHONG TAI DUOC Node.js. Kiem tra ket noi mang roi bam dup lai file nay.
echo  Neu van loi: tu tai Node.js ban LTS tai https://nodejs.org , cai xong roi chay lai.
echo.
pause
exit /b 1

:hash_failed
del "%NODE_ZIP%" >nul 2>nul
echo.
echo  File Node.js tai ve khong khop ma kiem tra nen da bi xoa (co the tai loi giua chung).
echo  Hay bam dup lai file nay de tai lai.
echo.
pause
exit /b 1
