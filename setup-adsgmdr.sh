#!/bin/bash

################################################################################
#
# ADSGMDR.IT SETUP SCRIPT
# =======================
#
# Setup completo per il server di test con:
# - Frontend React
# - Backend Node.js + PM2
# - Nginx reverse proxy
#
# UTILIZZO:
#   chmod +x setup-adsgmdr.sh
#   sudo ./setup-adsgmdr.sh
#
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ============================================================================
# CONFIGURATION
# ============================================================================

DOMAIN="adsgmdr.it"
BACKEND_DIR="/var/www/adsgmdr/sdarmitalia-server"
FRONTEND_DIR="/var/www/adsgmdr/sdarmitalia"
FRONTEND_BUILD="/var/www/adsgmdr/frontend"
NGINX_CONF="/etc/nginx/sites-available/adsgmdr.it"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   ADSGMDR.IT SERVER SETUP${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# STEP 1: CHECK PREREQUISITES
# ============================================================================

log_info "Step 1: Verifiche prerequisiti..."

if [ "$EUID" -ne 0 ]; then
    log_error "Esegui come root: sudo ./setup-adsgmdr.sh"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend non trovato: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Frontend non trovato: $FRONTEND_DIR"
    exit 1
fi

log_success "Prerequisiti OK"

# ============================================================================
# STEP 2: SETUP BACKEND
# ============================================================================

log_info "Step 2: Setup Backend..."

cd "$BACKEND_DIR"

# Copia config.env da example se non esiste
if [ ! -f "config.env" ]; then
    log_warn "config.env non trovato, copio da example..."
    cp config.env.example config.env
    log_info "⚠️  MODIFICA config.env con i tuoi dati:"
    log_info "   - STRIPE_SECRET_KEY"
    log_info "   - STRIPE_PUBLIC_KEY"
    log_info "   - STRIPE_WEBHOOK_SECRET"
    log_info "   - BENEFICIARY_*"
    exit 1
fi

# Installa dipendenze
log_info "Installazione dipendenze backend..."
npm ci --production

log_success "Backend OK"

# ============================================================================
# STEP 3: BUILD FRONTEND
# ============================================================================

log_info "Step 3: Build Frontend React..."

cd "$FRONTEND_DIR"

# Installa dipendenze
log_info "Installazione dipendenze frontend..."
npm ci --production

# Build
log_info "Build del progetto React..."
npm run build

# Copia build nella cartella di serving
if [ -d "$FRONTEND_BUILD" ]; then
    log_info "Rimuovo build precedente..."
    rm -rf "$FRONTEND_BUILD"
fi

log_info "Copia build in $FRONTEND_BUILD..."
mkdir -p "$FRONTEND_BUILD"
cp -r dist/* "$FRONTEND_BUILD/"

log_success "Frontend OK"

# ============================================================================
# STEP 4: SETUP PM2
# ============================================================================

log_info "Step 4: Setup PM2..."

cd "$BACKEND_DIR"

# Stop existing app
if pm2 list | grep -q "sdarmitalia-server"; then
    log_info "Stop app precedente..."
    pm2 stop sdarmitalia-server
    pm2 delete sdarmitalia-server
fi

# Start backend with PM2
log_info "Avvio backend con PM2..."
pm2 start server.js --name "sdarmitalia-server" \
    --output /var/log/pm2/sdarmitalia-server.log \
    --error /var/log/pm2/sdarmitalia-server-error.log

# Save PM2 config
pm2 save
pm2 startup systemd -u root --hp /root

log_success "PM2 OK"

# ============================================================================
# STEP 5: SETUP NGINX
# ============================================================================

log_info "Step 5: Setup Nginx..."

# Check if our config exists
if [ ! -f "$BACKEND_DIR/adsgmdr-nginx.conf" ]; then
    log_error "File di configurazione nginx non trovato"
    exit 1
fi

# Copy to nginx
log_info "Copia configurazione nginx..."
cp "$BACKEND_DIR/adsgmdr-nginx.conf" "$NGINX_CONF"

# Enable site
if [ ! -L "/etc/nginx/sites-enabled/adsgmdr.it" ]; then
    log_info "Abilito sito nginx..."
    ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
fi

# Test nginx config
log_info "Test configurazione nginx..."
if nginx -t 2>/dev/null; then
    log_success "Configurazione valida"
else
    log_error "Errore in configurazione nginx"
    nginx -t
    exit 1
fi

# Reload nginx
log_info "Ricarico nginx..."
systemctl reload nginx

log_success "Nginx OK"

# ============================================================================
# STEP 6: VERIFY EVERYTHING
# ============================================================================

log_info "Step 6: Verifica finale..."

sleep 2

# Check PM2 status
pm2_status=$(pm2 status | grep "sdarmitalia-server" | awk '{print $10}')
if [ "$pm2_status" = "online" ]; then
    log_success "PM2 app è online"
else
    log_warn "PM2 app status: $pm2_status"
fi

# Check backend responds
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ | grep -q "200\|301\|302"; then
    log_success "Backend risponde sulla porta 5000"
else
    log_warn "Backend non risponde ancora"
fi

# Check nginx config
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ &>/dev/null; then
    log_success "Sito accessibile da http://$DOMAIN"
else
    log_warn "Sito non accessibile (possibile problema DNS/firewall)"
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SETUP COMPLETATO!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📍 Percorsi:${NC}"
echo "   Frontend: $FRONTEND_BUILD"
echo "   Backend: $BACKEND_DIR"
echo "   Nginx: $NGINX_CONF"
echo ""
echo -e "${GREEN}🚀 Comandi utili:${NC}"
echo "   pm2 status                           # Mostra stato"
echo "   pm2 logs sdarmitalia-server          # Mostra log"
echo "   pm2 restart sdarmitalia-server       # Riavvia backend"
echo "   sudo systemctl reload nginx          # Ricarica nginx"
echo "   sudo nginx -t                        # Test configurazione nginx"
echo ""
echo -e "${GREEN}🌐 Accesso:${NC}"
echo "   http://$DOMAIN"
echo "   http://www.$DOMAIN"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
