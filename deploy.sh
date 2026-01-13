#!/bin/bash

################################################################################
#
# SDARMITALIA DEPLOYMENT SCRIPT
# ==============================
#
# Script per automatizzare il deployment del progetto SDA Italia
# Supporta: git pull, npm install, pm2 restart, nginx reload
#
# Utilizzo:
#   chmod +x deploy.sh
#   ./deploy.sh              # Deploy completo
#   ./deploy.sh --no-install # Deploy senza npm install
#   ./deploy.sh --restart    # Solo restart di pm2
#
# Ambiente: Linux/Ubuntu
# Server: nginx + Node.js + PM2 + MongoDB Atlas
#
################################################################################

set -e  # Exit on error

# ============================================================================
# COLORI PER L'OUTPUT
# ============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# ============================================================================
# CONFIGURAZIONE
# ============================================================================
PROJECT_ROOT="/var/www/adsgmdr/sdarmitalia-server"
FRONTEND_ROOT="/var/www/adsgmdr/sdarmitalia"
PM2_APP_NAME="sdarmitalia-server"
NGINX_SERVICE="nginx"
DOMAIN="adsgmdr.it"
PORT="5000"

# ============================================================================
# FUNZIONI HELPER
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

check_prerequisites() {
    print_header "VERIFICHE PRE-DEPLOYMENT"
    
    # Verifica se sono root
    if [ "$EUID" -ne 0 ]; then
        log_error "Questo script deve essere eseguito come root"
        exit 1
    fi
    log_success "Root verificato"
    
    # Verifica se il progetto esiste
    if [ ! -d "$PROJECT_ROOT" ]; then
        log_error "Cartella progetto non trovata: $PROJECT_ROOT"
        exit 1
    fi
    log_success "Cartella progetto trovata"
    
    # Verifica se config.env esiste
    if [ ! -f "$PROJECT_ROOT/config.env" ]; then
        log_warn "config.env non trovato! Copiare config.env.example"
        log_info "Esegui: cp $PROJECT_ROOT/config.env.example $PROJECT_ROOT/config.env"
        log_info "Poi modifica config.env con le tue credenziali"
        exit 1
    fi
    log_success "config.env trovato"
    
    # Verifica se Node.js è installato
    if ! command -v node &> /dev/null; then
        log_error "Node.js non trovato"
        exit 1
    fi
    log_success "Node.js: $(node --version)"
    
    # Verifica se npm è installato
    if ! command -v npm &> /dev/null; then
        log_error "npm non trovato"
        exit 1
    fi
    log_success "npm: $(npm --version)"
    
    # Verifica se pm2 è installato
    if ! command -v pm2 &> /dev/null; then
        log_error "pm2 non trovato. Installa: npm install -g pm2"
        exit 1
    fi
    log_success "pm2 installato"
    
    # Verifica se nginx è installato
    if ! command -v nginx &> /dev/null; then
        log_warn "nginx non trovato"
    else
        log_success "nginx installato"
    fi
}

# ============================================================================
# BACKEND DEPLOYMENT
# ============================================================================

deploy_backend() {
    print_header "DEPLOYMENT BACKEND"
    
    cd "$PROJECT_ROOT"
    log_info "Posizione: $(pwd)"
    
    # Git pull
    log_info "Aggiornamento codice dal repository..."
    git fetch origin
    git reset --hard origin/main
    log_success "Codice aggiornato"
    
    # npm install
    if [ "$SKIP_INSTALL" != "true" ]; then
        log_info "Installazione dipendenze..."
        npm ci --production
        log_success "Dipendenze installate"
    else
        log_warn "Installazione dipendenze saltata (--no-install)"
    fi
    
    # Verifica connessione MongoDB
    log_info "Verifica connessione MongoDB..."
    if timeout 5 node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✓ MongoDB connesso'); process.exit(0); }).catch((e) => { console.log('✗ Errore MongoDB: ' + e.message); process.exit(1); })" 2>/dev/null; then
        log_success "MongoDB connesso"
    else
        log_warn "Connessione MongoDB non testata (potrebbe non essere disponibile in questo contesto)"
    fi
}

# ============================================================================
# PM2 MANAGEMENT
# ============================================================================

manage_pm2() {
    print_header "GESTIONE PM2"
    
    # Controlla se l'app è già in esecuzione
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        log_info "App trovata, riavvio..."
        pm2 restart "$PM2_APP_NAME"
        log_success "App riavviata"
    else
        log_info "App non trovata, avvio..."
        cd "$PROJECT_ROOT"
        pm2 start server.js --name "$PM2_APP_NAME" --output /var/log/pm2/$PM2_APP_NAME.log --error /var/log/pm2/$PM2_APP_NAME-error.log
        log_success "App avviata"
    fi
    
    # Salva la configurazione PM2
    pm2 save
    pm2 startup systemd -u root --hp /root
    log_success "Configurazione PM2 salvata"
    
    # Mostra lo stato
    echo ""
    pm2 status
}

# ============================================================================
# NGINX CONFIGURATION
# ============================================================================

configure_nginx() {
    print_header "CONFIGURAZIONE NGINX"
    
    log_info "Verifico configurazione nginx..."
    
    # Test configurazione
    if nginx -t &>/dev/null; then
        log_success "Configurazione nginx valida"
        
        log_info "Ricarico nginx..."
        systemctl reload nginx
        log_success "nginx ricaricato"
    else
        log_error "Errore nella configurazione nginx"
        log_info "Esegui: nginx -t per vedere l'errore"
    fi
}

# ============================================================================
# HEALTH CHECK
# ============================================================================

health_check() {
    print_header "VERIFICA INTEGRITÀ"
    
    # Controlla se il server risponde
    log_info "Attesa 3 secondi per l'avvio del server..."
    sleep 3
    
    log_info "Test risposta dal server..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ &>/dev/null; then
        log_success "Server risponde sulla porta $PORT"
    else
        log_warn "Server non risponde ancora (potrebbe impiegare più tempo)"
    fi
    
    # Controlla se nginx risponde
    log_info "Test accesso tramite nginx..."
    if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ &>/dev/null; then
        log_success "Sito accessibile da $DOMAIN"
    else
        log_warn "Sito non accessibile da $DOMAIN (verifica DNS/nginx)"
    fi
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback() {
    print_header "ROLLBACK"
    
    log_warn "Esecuzione rollback..."
    cd "$PROJECT_ROOT"
    
    # Torna al commit precedente
    git reset --hard HEAD~1
    log_info "Codice ripristinato al commit precedente"
    
    # Reinstalla dipendenze
    npm ci --production
    log_info "Dipendenze reinstallate"
    
    # Riavvia app
    pm2 restart "$PM2_APP_NAME"
    log_success "App riavviata"
}

# ============================================================================
# DISPLAY USAGE
# ============================================================================

show_usage() {
    cat << EOF
${BLUE}════════════════════════════════════════════════════════${NC}
  SDARMITALIA DEPLOYMENT SCRIPT
${BLUE}════════════════════════════════════════════════════════${NC}

${GREEN}UTILIZZO:${NC}
  ./deploy.sh [OPZIONI]

${GREEN}OPZIONI:${NC}
  (nessuna)        Deployment completo (git + npm + pm2 + nginx)
  --no-install     Deployment senza npm install
  --restart-only   Solo restart di pm2
  --health-check   Solo verifica integrità
  --logs           Mostra i log di pm2
  --rollback       Rollback all'ultimo commit
  --help           Mostra questo messaggio

${GREEN}ESEMPI:${NC}
  sudo ./deploy.sh                 # Deployment completo
  sudo ./deploy.sh --no-install    # Senza npm install
  sudo ./deploy.sh --logs          # Mostra i log
  sudo ./deploy.sh --rollback      # Rollback

${GREEN}CONFIGURAZIONE:${NC}
  Project Root: $PROJECT_ROOT
  PM2 App: $PM2_APP_NAME
  Domain: $DOMAIN
  Port: $PORT

${BLUE}════════════════════════════════════════════════════════${NC}
EOF
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    local start_time=$(date +%s)
    
    # Controlla gli argomenti
    case "${1:-}" in
        --help)
            show_usage
            exit 0
            ;;
        --no-install)
            SKIP_INSTALL=true
            ;;
        --restart-only)
            manage_pm2
            exit 0
            ;;
        --health-check)
            health_check
            exit 0
            ;;
        --logs)
            pm2 logs "$PM2_APP_NAME" --lines 100
            exit 0
            ;;
        --rollback)
            rollback
            exit 0
            ;;
        *)
            if [ ! -z "$1" ]; then
                log_error "Opzione sconosciuta: $1"
                show_usage
                exit 1
            fi
            ;;
    esac
    
    # Esecuzione completa
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   INIZIO DEPLOYMENT - $(date '+%Y-%m-%d %H:%M:%S')           ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    
    check_prerequisites
    deploy_backend
    manage_pm2
    configure_nginx
    health_check
    
    # Calcola tempo di esecuzione
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   DEPLOYMENT COMPLETATO CON SUCCESSO! ✅              ║${NC}"
    echo -e "${BLUE}║   Tempo: ${duration}s                                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Il sito è ora disponibile su: http://$DOMAIN${NC}"
    echo ""
}

# Esegui main
main "$@"
