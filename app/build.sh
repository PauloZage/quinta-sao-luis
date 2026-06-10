#!/usr/bin/env bash
# build.sh — compila o frontend e prepara o backend para correr localmente.
set -e
echo "1/3 A compilar o frontend..."
cd frontend && npm install && npm run build && cd ..
echo "2/3 A copiar o frontend para o backend..."
rm -rf backend/public && cp -r frontend/dist backend/public
echo "3/3 A instalar o backend..."
cd backend && npm install && cd ..
echo ""
echo "Pronto! Para iniciar:  cd backend && npm start"
echo "Depois abra:  http://localhost:3000"
