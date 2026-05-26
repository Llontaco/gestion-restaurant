#!/usr/bin/env bash
# ============================================================
#  setup.sh — Configurar y correr gestion-restaurant completo
#  Uso: bash setup.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "================================================="
echo "  🍔  Gestion Restaurant — Setup & Run"
echo "================================================="
echo -e "${NC}"

# ── 1. Verificar Node.js ──────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"

# ── 2. Configurar backend ─────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install --silent

# Verificar .env
if [ ! -f .env ]; then
  cp .env.example .env 2>/dev/null || true
fi

echo -e "${YELLOW}🗄️  Generando Prisma client...${NC}"
npx prisma generate

echo ""
echo -e "${CYAN}================================================="
echo "  Configuración de Base de Datos"
echo "================================================="
echo -e "${NC}"
echo -e "${YELLOW}⚠️  Antes de continuar, asegúrate de:${NC}"
echo "   1. Tener MySQL Workbench corriendo"
echo "   2. Haber creado la base de datos: ${CYAN}gestion_restaurant${NC}"
echo "      SQL: CREATE DATABASE gestion_restaurant;"
echo "   3. Haber configurado tu .env con las credenciales correctas"
echo "      Archivo: backend/.env"
echo ""
echo -n "¿Continuar con la migración? (s/n): "
read -r answer

if [[ "$answer" =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}🔄 Ejecutando migraciones...${NC}"
  npx prisma migrate dev --name init 2>/dev/null || npx prisma db push
  
  echo -e "${YELLOW}🌱 Cargando datos iniciales (seed)...${NC}"
  npx ts-node src/seed.ts
  echo -e "${GREEN}✅ Base de datos lista!${NC}"
else
  echo -e "${YELLOW}⏭️  Saltando migración. Puedes ejecutarla después con:${NC}"
  echo "   cd backend && npm run db:migrate && npm run db:seed"
fi

cd ..

# ── 3. Configurar frontend ────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
npm install --silent
echo -e "${GREEN}✅ Frontend listo!${NC}"

# ── 4. Iniciar ambos ──────────────────────────────────────
echo ""
echo -e "${GREEN}================================================="
echo "  🚀 Iniciando servicios..."
echo "================================================="
echo -e "${NC}"
echo -e "  Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "  Backend:  ${CYAN}http://localhost:3001${NC}"
echo -e "  API:      ${CYAN}http://localhost:3001/api${NC}"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

# Iniciar backend en background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar que el backend arranque
sleep 2

# Iniciar frontend
npm run dev

# Cleanup al salir
trap "kill $BACKEND_PID 2>/dev/null" EXIT
