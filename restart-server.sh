#!/bin/bash
# Script per killare il processo sulla porta 5000 e riavviare il server

# Trova il PID del processo sulla porta 5000
echo "🔍 Cercando processo sulla porta 5000..."
PID=$(lsof -i :5000 -t)

if [ -z "$PID" ]; then
  echo "❌ Nessun processo trovato sulla porta 5000"
else
  echo "✅ Processo trovato con PID: $PID"
  echo "🔨 Terminando processo..."
  kill -9 $PID
  echo "✓ Processo terminato"
fi

# Attendere un momento
sleep 2

# Riavviare il server
echo ""
echo "🚀 Avviando il server..."
cd /var/www/adsgmdr/sdarmitalia-server
npm start
