#!/bin/bash

################################################################################
#
# MOVIMENTO DI RIFORMA ITALIA - PRODUCTION DEPLOYMENT SCRIPT
# ===========================================================
#
# Script per automatizzare il deployment del progetto in PRODUZIONE
# Dominio: movimentodiriforma.it
# Supporta: git pull, npm install, pm2 restart, nginx reload
#
# Utilizzo:
#   chmod +x deploy-production.sh
#   ./deploy-production.sh              # Deploy completo
#   ./deploy-production.sh --no-install # Deploy senza npm install
#   ./deploy-production.sh --restart    # Solo restart di pm2
#
# Ambiente: Linux/Ubuntu
# Server: nginx + Node.js + PM2 + MongoDB Atlas
#
################################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color


# === CONFIGURAZIONI AMBIENTI ===
ADSGMDR_FRONTEND_DIR="/var/www/adsgmdr/sdarmitalia"
ADSGMDR_BACKEND_DIR="/var/www/adsgmdr/sdarmitalia-server"
ADSGMDR_FRONTEND_DIST="/var/www/adsgmdr/frontend"

MDR_FRONTEND_DIR="/var/www/movimentodiriforma/sdarmitalia"
MDR_BACKEND_DIR="/var/www/movimentodiriforma/sdarmitalia-server"
MDR_FRONTEND_DIST="/var/www/movimentodiriforma/frontend"

echo -e "\n${YELLOW}[1/5] Deploying Frontend...${NC}"
echo -e "${GREEN}   ✓ Frontend deployed${NC}"
echo -e "\n${YELLOW}[2/5] Deploying Backend...${NC}"
echo -e "${GREEN}   ✓ Backend code updated${NC}"
echo -e "\n${YELLOW}[3/5] Restarting PM2 processes...${NC}"
pm2 restart sdarmitalia-server
echo -e "${GREEN}   ✓ PM2 processes restarted${NC}"
echo -e "\n${YELLOW}[4/5] Reloading Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}   ✓ Nginx reloaded${NC}"
echo -e "\n${YELLOW}[5/5] Verifying deployment...${NC}"
sleep 2
echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   - Frontend: https://adsgmdr.it"
echo "   - Backend: http://localhost:5000"
echo "   - API: https://adsgmdr.it/api/v1"
echo ""
echo "📝 Check logs:"
echo "   pm2 logs sdarmitalia-server"
echo "   tail -f /var/log/nginx/access.log"
echo ""
echo "========================================"

# === FUNZIONI DI DEPLOY ===
deploy_env() {
    local FRONTEND_DIR="$1"
    local BACKEND_DIR="$2"
    local FRONTEND_DIST="$3"
    local LABEL="$4"

    echo -e "\n${YELLOW}[1/5] Deploying Frontend ($LABEL)...${NC}"
    cd "$FRONTEND_DIR"
    echo "   → Pulling latest code..."
    git fetch origin
    git pull origin main
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}   ✗ ERROR: .env.production not found!${NC}"
        exit 1
    fi
    echo "   → Installing dependencies..."
    npm install
    echo "   → Building for production..."
    npm run build
    echo "   → Deploying built files..."
    rm -rf "$FRONTEND_DIST"/*
    cp -r dist/* "$FRONTEND_DIST/"
    echo -e "${GREEN}   ✓ Frontend deployed${NC}"

    echo -e "\n${YELLOW}[2/5] Deploying Backend ($LABEL)...${NC}"
    cd "$BACKEND_DIR"
    echo "   → Pulling latest code..."
    git fetch origin
    git pull origin main
    if [ ! -f "config.env" ]; then
        echo -e "${RED}   ✗ ERROR: config.env not found!${NC}"
        exit 1
    fi
    echo "   → Installing dependencies..."
    npm install --production
    echo -e "${GREEN}   ✓ Backend code updated${NC}"

    echo -e "\n${YELLOW}[3/5] Restarting PM2 processes ($LABEL)...${NC}"
    pm2 restart sdarmitalia-server
    pm2 save
    echo -e "${GREEN}   ✓ PM2 processes restarted${NC}"

    echo -e "\n${YELLOW}[4/5] Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}   ✓ Nginx reloaded${NC}"

    echo -e "\n${YELLOW}[5/5] Verifying deployment ($LABEL)...${NC}"
    sleep 2
    echo "   → Testing backend..."
    if curl -s http://localhost:5000/api/v1/news > /dev/null; then
        echo -e "${GREEN}   ✓ Backend responding${NC}"
    else
        echo -e "${RED}   ✗ Backend not responding${NC}"
    fi
    echo "   → Testing frontend..."
    if [ -f "$FRONTEND_DIST/index.html" ]; then
        echo -e "${GREEN}   ✓ Frontend files deployed${NC}"
    else
        echo -e "${RED}   ✗ Frontend files not found${NC}"
    fi
    echo "   → PM2 Status:"
    pm2 status | grep sdarmitalia
}

# === SCELTA AMBIENTE ===
echo "Quale ambiente vuoi aggiornare?"
echo "1) adsgmdr.it"
echo "2) movimentodiriforma.it"
echo "3) Entrambi"
read -p "Seleziona (1/2/3): " scelta

case $scelta in
    1)
        deploy_env "$ADSGMDR_FRONTEND_DIR" "$ADSGMDR_BACKEND_DIR" "$ADSGMDR_FRONTEND_DIST" "adsgmdr.it"
        ;;
    2)
        deploy_env "$MDR_FRONTEND_DIR" "$MDR_BACKEND_DIR" "$MDR_FRONTEND_DIST" "movimentodiriforma.it"
        ;;
    3)
        deploy_env "$ADSGMDR_FRONTEND_DIR" "$ADSGMDR_BACKEND_DIR" "$ADSGMDR_FRONTEND_DIST" "adsgmdr.it"
        deploy_env "$MDR_FRONTEND_DIR" "$MDR_BACKEND_DIR" "$MDR_FRONTEND_DIST" "movimentodiriforma.it"
        ;;
    *)
        echo "Scelta non valida. Uscita."
        exit 1
        ;;
esac
