@echo off
title FDA App Launcher
cd /d "%~dp0"
echo ====================================================
echo  CHAO MUNG DEN VOI PHAN MEM THEO DOI BIEN DONG FDA 
echo ====================================================
echo.

echo 1. Dang kiem tra thu vien cho Backend...
cd apps\api
if not exist node_modules (
    echo [OK] Dang cai dat thu vien cho Backend [vui long doi]...
    call npm i -f
)
echo [OK] Backend da san sang.
cd ..\..

echo 2. Dang kiem tra thu vien cho Frontend Web...
cd apps\web
if not exist node_modules (
    echo [OK] Dang cai dat thu vien cho Frontend [vui long doi]...
    call npm i -f
)
echo [OK] Frontend da san sang.
cd ..\..

echo 3. Dang khoi dong cac ung dung...
start "FDA Backend API" cmd /k "cd apps\api && npm run dev"
start "FDA Frontend Web" cmd /k "cd apps\web && npm run dev"

echo.
echo [ Thanh Cong ] Ung dung dang duoc khoi dong ngam!
echo Vui long cho 5-10 giay, trinh duyet se tu dong mo.
echo.
ping 127.0.0.1 -n 6 >nul
start http://localhost:3000
exit
