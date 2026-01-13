#!/bin/bash

################################################################################
#
# ADSGMDR.IT PRE-DEPLOYMENT CHECKLIST
# ===================================
#
# Esegui questo script prima di deployare
# Verifica tutti i requisiti e configurazioni
#
# UTILIZZO:
#   chmod +x check-deployment.sh
#   sudo ./check-deployment.sh
#
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
}

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN++))
}

# ============================================================================
# SYSTEM CHECKS
# ============================================================================

print_header "SYSTEM CHECKS"

# Root check
if [ "$EUID" -eq 0 ]; then
    check_pass "Running as root"
else
    check_warn "Not running as root (some checks may fail)"
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not found"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not found"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    check_pass "Git installed: $GIT_VERSION"
else
    check_fail "Git not found"
fi

# Nginx
if command -v nginx &> /dev/null; then
    check_pass "Nginx installed"
else
    check_fail "Nginx not found"
fi

# PM2
if command -v pm2 &> /dev/null; then
    check_pass "PM2 installed"
else
    check_fail "PM2 not found"
fi

# ============================================================================
# DIRECTORY CHECKS
# ============================================================================

print_header "DIRECTORY STRUCTURE"

BACKEND_DIR="/var/www/adsgmdr/sdarmitalia-server"
FRONTEND_DIR="/var/www/adsgmdr/sdarmitalia"
FRONTEND_BUILD="/var/www/adsgmdr/frontend"

if [ -d "$BACKEND_DIR" ]; then
    check_pass "Backend directory exists: $BACKEND_DIR"
else
    check_fail "Backend directory not found: $BACKEND_DIR"
fi

if [ -d "$FRONTEND_DIR" ]; then
    check_pass "Frontend directory exists: $FRONTEND_DIR"
else
    check_fail "Frontend directory not found: $FRONTEND_DIR"
fi

if [ -d "$FRONTEND_BUILD" ]; then
    check_pass "Frontend build directory exists: $FRONTEND_BUILD"
else
    check_warn "Frontend build directory not found (will be created)"
fi

# ============================================================================
# CONFIGURATION CHECKS
# ============================================================================

print_header "CONFIGURATION FILES"

# config.env
if [ -f "$BACKEND_DIR/config.env" ]; then
    check_pass "config.env exists"
    
    # Check for required variables
    if grep -q "MONGODB_URI" "$BACKEND_DIR/config.env"; then
        check_pass "MONGODB_URI configured"
    else
        check_fail "MONGODB_URI not found in config.env"
    fi
    
    if grep -q "STRIPE_SECRET_KEY" "$BACKEND_DIR/config.env"; then
        check_pass "STRIPE_SECRET_KEY configured"
    else
        check_fail "STRIPE_SECRET_KEY not found in config.env"
    fi
    
    if grep -q "STRIPE_PUBLIC_KEY" "$BACKEND_DIR/config.env"; then
        check_pass "STRIPE_PUBLIC_KEY configured"
    else
        check_fail "STRIPE_PUBLIC_KEY not found in config.env"
    fi
    
    if grep -q "STRIPE_WEBHOOK_SECRET" "$BACKEND_DIR/config.env"; then
        check_pass "STRIPE_WEBHOOK_SECRET configured"
    else
        check_fail "STRIPE_WEBHOOK_SECRET not found in config.env"
    fi
    
    if grep -q "BENEFICIARY_IBAN" "$BACKEND_DIR/config.env"; then
        check_pass "BENEFICIARY_IBAN configured"
    else
        check_fail "BENEFICIARY_IBAN not found in config.env"
    fi
else
    check_fail "config.env not found"
fi

# Nginx config
if [ -f "/etc/nginx/sites-available/adsgmdr.it" ]; then
    check_pass "Nginx configuration exists"
else
    check_warn "Nginx configuration not found"
fi

# ============================================================================
# PORT CHECKS
# ============================================================================

print_header "PORT AVAILABILITY"

# Port 5000 (Node.js)
if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
    check_warn "Port 5000 is in use (will be replaced by new instance)"
else
    check_pass "Port 5000 is available"
fi

# Port 80 (HTTP)
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    check_pass "Port 80 is in use (nginx)"
else
    check_warn "Port 80 might not be available"
fi

# Port 443 (HTTPS)
if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    check_pass "Port 443 is in use (nginx)"
else
    check_warn "Port 443 might not be available"
fi

# ============================================================================
# CERTIFICATE CHECKS
# ============================================================================

print_header "SSL/TLS CERTIFICATES"

if [ -f "/etc/letsencrypt/live/adsgmdr.it-0001/fullchain.pem" ]; then
    check_pass "SSL certificate exists"
    
    # Check expiry date
    if command -v openssl &> /dev/null; then
        EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/adsgmdr.it-0001/fullchain.pem | cut -d= -f2)
        check_pass "Certificate expiry: $EXPIRY"
    fi
else
    check_fail "SSL certificate not found"
fi

# ============================================================================
# DATABASE CHECKS
# ============================================================================

print_header "DATABASE CONNECTIVITY"

if [ -f "$BACKEND_DIR/config.env" ]; then
    MONGODB_URI=$(grep "MONGODB_URI=" "$BACKEND_DIR/config.env" | cut -d= -f2)
    
    if [ ! -z "$MONGODB_URI" ]; then
        check_pass "MongoDB URI configured"
        
        # Try to connect (requires mongosh)
        if command -v mongosh &> /dev/null; then
            if timeout 5 mongosh "$MONGODB_URI" --eval "db.runCommand({ping: 1})" &>/dev/null; then
                check_pass "MongoDB connection successful"
            else
                check_fail "Cannot connect to MongoDB"
            fi
        else
            check_warn "mongosh not installed (cannot test connection)"
        fi
    else
        check_fail "MongoDB URI is empty"
    fi
fi

# ============================================================================
# PM2 CHECKS
# ============================================================================

print_header "PM2 STATUS"

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "sdarmitalia-server"; then
        STATUS=$(pm2 list | grep "sdarmitalia-server" | awk '{print $10}')
        check_pass "PM2 app found (status: $STATUS)"
    else
        check_warn "PM2 app not running (will be started)"
    fi
    
    # Check PM2 startup
    if [ -f "/etc/systemd/system/pm2-root.service" ]; then
        check_pass "PM2 startup configured"
    else
        check_warn "PM2 startup not configured"
    fi
else
    check_fail "PM2 not installed"
fi

# ============================================================================
# NGINX CHECKS
# ============================================================================

print_header "NGINX CONFIGURATION"

if command -v nginx &> /dev/null; then
    if nginx -t 2>/dev/null; then
        check_pass "Nginx configuration is valid"
    else
        check_fail "Nginx configuration has errors"
        nginx -t
    fi
    
    if systemctl is-active --quiet nginx; then
        check_pass "Nginx is running"
    else
        check_warn "Nginx is not running"
    fi
else
    check_fail "Nginx not installed"
fi

# ============================================================================
# CONNECTIVITY CHECKS
# ============================================================================

print_header "CONNECTIVITY TESTS"

# Check backend on localhost
if timeout 5 curl -s http://localhost:5000/ >/dev/null 2>&1; then
    check_pass "Backend responds on localhost:5000"
else
    check_warn "Backend not responding on localhost:5000"
fi

# Check domain
if timeout 5 curl -s https://adsgmdr.it/ >/dev/null 2>&1; then
    check_pass "Domain is accessible: https://adsgmdr.it"
else
    check_warn "Domain not accessible (check DNS/firewall)"
fi

# ============================================================================
# PACKAGE DEPENDENCIES
# ============================================================================

print_header "DEPENDENCIES"

if [ -d "$BACKEND_DIR/node_modules" ]; then
    check_pass "Backend node_modules exists"
else
    check_warn "Backend node_modules not found (will be installed)"
fi

if [ -d "$FRONTEND_DIR/node_modules" ]; then
    check_pass "Frontend node_modules exists"
else
    check_warn "Frontend node_modules not found (will be installed)"
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_header "SUMMARY"

echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo -e "${BLUE}Next step: Run deployment script${NC}"
    echo -e "${BLUE}  sudo /var/www/adsgmdr/sdarmitalia-server/setup-adsgmdr.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix the issues above before deploying.${NC}"
    exit 1
fi
