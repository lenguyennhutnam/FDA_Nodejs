@echo off
title FDA App Launcher
echo ====================================================
echo  CHAO MUNG DEN VOI PHAN MEM THEO DOI BIEN DONG FDA 
echo ====================================================
echo.

echo 1. Dang kiem tra thu vien cho Backend...
cd apps\api
if not exist node_modules (
    echo [OK] Dang cai dat thu vien cho Backend (vui long doi)...
    call yarn install
)
echo [OK] Backend da san sang.
cd ..\..

echo 2. Dang kiem tra thu vien cho Frontend Web...
cd apps\web
if not exist node_modules (
    echo [OK] Dang cai dat thu vien cho Frontend (vui long doi)...
    call yarn install
)
echo [OK] Frontend da san sang.
cd ..\..

echo 3. Dang khoi dong cac ung dung...
start "FDA Backend API" cmd /c "cd apps\api && yarn dev"
start "FDA Frontend Web" cmd /c "cd apps\web && yarn dev"

echo.
echo [ Thanh Cong ] Ung dung dang duoc khoi dong ngam!
echo Vui long cho 5-10 giay, trinh duyet se tu dong mo.
echo.
timeout /t 5 >nul
start http://localhost:3000
exit
