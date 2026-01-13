#!/bin/bash
# ============================================
# QUICK SERVER SETUP FOR DEPLOYMENT
# ============================================
# Run ONCE on adsgmdr.it to prepare for first deployment
# After running this, use deploy-production.sh for future updates

set -e

echo "🔧 SDARM Italia - Server First-Time Setup"
echo "=========================================="
echo ""

FRONTEND_DIR="/var/www/adsgmdr/sdarmitalia"
BACKEND_DIR="/var/www/adsgmdr/sdarmitalia-server"
FRONTEND_DIST="/var/www/adsgmdr/frontend"

# ============================================
# STEP 1: Clone or Pull Repositories
# ============================================

echo "📥 [1/5] Cloning/Updating Repositories..."

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "   → Cloning frontend repository..."
    cd /var/www/adsgmdr
    git clone https://github.com/johnmukenge/sdarmitalia.git
else
    echo "   → Updating frontend repository..."
    cd "$FRONTEND_DIR"
    git pull origin main
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "   → Cloning backend repository..."
    cd /var/www/adsgmdr
    git clone https://github.com/johnmukenge/sdarmitalia-server.git
else
    echo "   → Updating backend repository..."
    cd "$BACKEND_DIR"
    git pull origin main
fi

# ============================================
# STEP 2: Create Frontend Environment File
# ============================================

echo ""
echo "🔐 [2/5] Creating Frontend Environment File..."

if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    cat > "$FRONTEND_DIR/.env.production" << 'EOF'
VITE_STRIPE_PUBLIC_KEY=pk_test_51SnNDQK15KBllqruzBlxvfdv95a6TAHnOpq5NN1v20LDprvNUsg1LMaoRxBfLO0NMDNBMCKf9wDKc4ZO5CJ3n30I00g0LvFUHg
VITE_API_URL=/api/v1
VITE_ENABLE_TTS=true
VITE_ENABLE_DONATIONS=true
VITE_ENABLE_ANALYTICS=false
VITE_APP_NAME=AVVENTISTI DEL SETTIMO GIORNO MOVIMENTO DI RIFORMA
VITE_APP_VERSION=2.0.0
EOF
    echo "   ✓ Created .env.production"
else
    echo "   ℹ .env.production already exists"
fi

# ============================================
# STEP 3: Create Backend Configuration File
# ============================================

echo ""
echo "🔐 [3/5] Creating Backend Configuration..."

if [ ! -f "$BACKEND_DIR/config.env" ]; then
    echo "   ⚠ config.env does NOT exist!"
    echo ""
    echo "   Please create it with:"
    echo ""
    echo "   cat > $BACKEND_DIR/config.env << 'EOF'"
    echo "NODE_ENV=production"
    echo "PORT=5000"
    echo "MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/sdarmitalia?retryWrites=true&w=majority"
    echo "STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY"
    echo "STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLIC_KEY"
    echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET"
    echo "CORS_ORIGINS=https://adsgmdr.it,https://www.adsgmdr.it"
    echo "LOG_LEVEL=info"
    echo "EOF"
    echo ""
    echo "   Then run this script again."
    exit 1
else
    echo "   ✓ config.env exists"
fi

# ============================================
# STEP 4: Install Dependencies & Build
# ============================================

echo ""
echo "📦 [4/5] Installing Dependencies & Building..."

cd "$FRONTEND_DIR"
echo "   → Frontend dependencies..."
npm install --production

echo "   → Frontend build..."
npm run build

cd "$BACKEND_DIR"
echo "   → Backend dependencies..."
npm install --production

# ============================================
# STEP 5: Deploy & Start
# ============================================

echo ""
echo "🚀 [5/5] Deploying & Starting Services..."

# Deploy frontend
echo "   → Deploying frontend files..."
mkdir -p "$FRONTEND_DIST"
rm -rf "$FRONTEND_DIST"/*
cp -r "$FRONTEND_DIR/dist"/* "$FRONTEND_DIST/"

# Restart backend
echo "   → Starting backend service..."
pm2 start "$BACKEND_DIR/server.js" --name sdarmitalia-server
pm2 save

# Reload Nginx
echo "   → Reloading Nginx..."
sudo systemctl reload nginx

# ============================================
# VERIFICATION
# ============================================

echo ""
echo "✅ Verifying Setup..."
sleep 2

echo "   → Checking backend..."
if curl -s http://localhost:5000/api/v1/news > /dev/null; then
    echo "   ✓ Backend responding"
else
    echo "   ✗ Backend not responding"
fi

echo "   → Checking frontend files..."
if [ -f "$FRONTEND_DIST/index.html" ]; then
    echo "   ✓ Frontend files deployed"
else
    echo "   ✗ Frontend files missing"
fi

echo "   → PM2 Status:"
pm2 status | grep sdarmitalia

# ============================================
# SUCCESS
# ============================================

echo ""
echo "=========================================="
echo "✅ Server Setup Complete!"
echo "=========================================="
echo ""
echo "Next time, to deploy updates, simply run:"
echo ""
echo "   bash $BACKEND_DIR/deploy-production.sh"
echo ""
echo "To check logs:"
echo "   pm2 logs sdarmitalia-server"
echo ""
echo "Website:"
echo "   https://adsgmdr.it"
echo ""
echo "API:"
echo "   https://adsgmdr.it/api/v1/news"
echo ""
