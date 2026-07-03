#!/bin/bash
echo "===================================================="
echo " CHAO MUNG DEN VOI PHAN MEM THEO DOI BIEN DONG FDA "
echo "===================================================="
echo ""

echo "1. Dang kiem tra thu vien cho Backend..."
cd apps/api
if [ ! -d "node_modules" ]; then
    echo "Dang cai dat thu vien cho Backend (vui long doi)..."
    yarn install
fi
echo "[OK] Backend da san sang."
cd ../..

echo "2. Dang kiem tra thu vien cho Frontend Web..."
cd apps/web
if [ ! -d "node_modules" ]; then
    echo "Dang cai dat thu vien cho Frontend (vui long doi)..."
    yarn install
fi
echo "[OK] Frontend da san sang."
cd ../..

echo "3. Dang khoi dong cac ung dung..."
# Start Backend in background
cd apps/api && yarn dev &
API_PID=$!

# Start Frontend in background
cd apps/web && yarn dev &
WEB_PID=$!

echo ""
echo "[ Thanh Cong ] Ung dung dang duoc khoi dong ngam!"
echo "Vui long cho 5-10 giay, trinh duyet se tu dong mo."
echo ""

sleep 5

# Open browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:3000"
fi

# Wait for background processes to keep terminal open
wait $API_PID $WEB_PID
