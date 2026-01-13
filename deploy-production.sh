#!/bin/bash
# ============================================
# SDARM ITALIA - PRODUCTION DEPLOYMENT SCRIPT
# ============================================
# Run this on adsgmdr.it server to deploy latest changes

set -e  # Exit on error

echo "🚀 Starting SDARM Italia Deployment..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="/var/www/adsgmdr/sdarmitalia"
BACKEND_DIR="/var/www/adsgmdr/sdarmitalia-server"
FRONTEND_DIST="/var/www/adsgmdr/frontend"

# ============================================
# STEP 1: FRONTEND DEPLOYMENT
# ============================================

echo -e "\n${YELLOW}[1/5] Deploying Frontend...${NC}"

cd "$FRONTEND_DIR"

# Pull latest code
echo "   → Pulling latest code..."
git fetch origin
git pull origin main

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}   ✗ ERROR: .env.production not found!${NC}"
    echo "   Please create .env.production with:"
    echo "   - VITE_STRIPE_PUBLIC_KEY"
    echo "   - VITE_API_URL=/api/v1"
    exit 1
fi

# Install dependencies
echo "   → Installing dependencies..."
npm install --production

# Build
echo "   → Building for production..."
npm run build

# Deploy built files
echo "   → Deploying built files..."
rm -rf "$FRONTEND_DIST"/*
cp -r dist/* "$FRONTEND_DIST/"

echo -e "${GREEN}   ✓ Frontend deployed${NC}"

# ============================================
# STEP 2: BACKEND DEPLOYMENT
# ============================================

echo -e "\n${YELLOW}[2/5] Deploying Backend...${NC}"

cd "$BACKEND_DIR"

# Pull latest code
echo "   → Pulling latest code..."
git fetch origin
git pull origin main

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo -e "${RED}   ✗ ERROR: config.env not found!${NC}"
    echo "   Please create config.env with:"
    echo "   - NODE_ENV=production"
    echo "   - MONGODB_URI=..."
    echo "   - STRIPE_SECRET_KEY=..."
    exit 1
fi

# Install dependencies
echo "   → Installing dependencies..."
npm install --production

echo -e "${GREEN}   ✓ Backend code updated${NC}"

# ============================================
# STEP 3: PM2 RESTART
# ============================================

echo -e "\n${YELLOW}[3/5] Restarting PM2 processes...${NC}"

pm2 restart sdarmitalia-server
pm2 save

echo -e "${GREEN}   ✓ PM2 processes restarted${NC}"

# ============================================
# STEP 4: NGINX RELOAD
# ============================================

echo -e "\n${YELLOW}[4/5] Reloading Nginx...${NC}"

sudo systemctl reload nginx

echo -e "${GREEN}   ✓ Nginx reloaded${NC}"

# ============================================
# STEP 5: VERIFICATION
# ============================================

echo -e "\n${YELLOW}[5/5] Verifying deployment...${NC}"

sleep 2

# Check backend
echo "   → Testing backend..."
if curl -s http://localhost:5000/api/v1/news > /dev/null; then
    echo -e "${GREEN}   ✓ Backend responding${NC}"
else
    echo -e "${RED}   ✗ Backend not responding${NC}"
fi

# Check frontend
echo "   → Testing frontend..."
if [ -f "$FRONTEND_DIST/index.html" ]; then
    echo -e "${GREEN}   ✓ Frontend files deployed${NC}"
else
    echo -e "${RED}   ✗ Frontend files not found${NC}"
fi

# Show PM2 status
echo "   → PM2 Status:"
pm2 status | grep sdarmitalia

# ============================================
# SUCCESS
# ============================================

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
