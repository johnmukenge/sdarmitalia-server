#!/bin/bash

# Test API Lezionari e Settimane di Preghiera
# Esegui questo script dopo aver importato i dati con seed-biblioteca-documenti.js

BASE_URL="http://localhost:5000/api/v1/libri"

echo "🧪 Test API Biblioteca Digitale - Lezionari e Settimane di Preghiera"
echo "=================================================================="
echo ""

# 1. Test tutti i lezionari
echo "1️⃣  Test: Tutti i lezionari"
echo "GET $BASE_URL/lezionari"
curl -s "$BASE_URL/lezionari" | jq '.results, .data.lezionari[].title'
echo ""
echo ""

# 2. Test lezionari 2026
echo "2️⃣  Test: Lezionari anno 2026"
echo "GET $BASE_URL/lezionari?anno=2026"
curl -s "$BASE_URL/lezionari?anno=2026" | jq '.results, .data.lezionari[].title'
echo ""
echo ""

# 3. Test lezionario Q1 2026
echo "3️⃣  Test: Lezionario Q1 2026"
echo "GET $BASE_URL/lezionari?anno=2026&trimestre=1"
curl -s "$BASE_URL/lezionari?anno=2026&trimestre=1" | jq '.data.lezionari[] | {title, anno, trimestre, downloads, views}'
echo ""
echo ""

# 4. Test settimane di preghiera
echo "4️⃣  Test: Settimane di Preghiera 2025"
echo "GET $BASE_URL/settimane-preghiera?anno=2025"
curl -s "$BASE_URL/settimane-preghiera?anno=2025" | jq '.data.settimane[] | {title, anno, downloads, views}'
echo ""
echo ""

# 5. Test anni disponibili
echo "5️⃣  Test: Anni disponibili"
echo "GET $BASE_URL/anni-disponibili"
curl -s "$BASE_URL/anni-disponibili" | jq '.data.anni'
echo ""
echo ""

# 6. Test statistiche biblioteca
echo "6️⃣  Test: Statistiche biblioteca"
echo "GET $BASE_URL/stats"
curl -s "$BASE_URL/stats" | jq '{totalBooks, publishedBooks, totalDownloads, byCategory}'
echo ""
echo ""

# 7. Test ricerca full-text
echo "7️⃣  Test: Ricerca full-text 'lezionario 2026'"
echo "GET $BASE_URL/search?q=lezionario+2026"
curl -s "$BASE_URL/search?q=lezionario+2026" | jq '.results, .data.libri[].title'
echo ""
echo ""

# 8. Test filtro per categoria
echo "8️⃣  Test: Filtro per categoria lezionario (endpoint generico)"
echo "GET $BASE_URL?category=lezionario"
curl -s "$BASE_URL?category=lezionario" | jq '.results, .data.libri[] | {title, category, anno, trimestre}'
echo ""
echo ""

# 9. Test filtro per categoria settimana_preghiera
echo "9️⃣  Test: Filtro per categoria settimana_preghiera"
echo "GET $BASE_URL?category=settimana_preghiera"
curl -s "$BASE_URL?category=settimana_preghiera" | jq '.data.libri[] | {title, category, anno}'
echo ""
echo ""

# 10. Test incremento views (necessita di ID libro)
echo "🔟 Test: Incremento views"
echo "Prima recupera un ID libro..."
LIBRO_ID=$(curl -s "$BASE_URL/lezionari?anno=2026&trimestre=1" | jq -r '.data.lezionari[0]._id')
echo "Libro ID: $LIBRO_ID"
echo "PATCH $BASE_URL/$LIBRO_ID/views"
curl -s -X PATCH "$BASE_URL/$LIBRO_ID/views" | jq '{status, message, data: {views}}'
echo ""
echo ""

# 11. Test incremento downloads
echo "1️⃣1️⃣  Test: Incremento downloads"
echo "POST $BASE_URL/$LIBRO_ID/download"
curl -s -X POST "$BASE_URL/$LIBRO_ID/download" | jq '{status, message, data: {downloads}}'
echo ""
echo ""

# 12. Test ordinamento per downloads
echo "1️⃣2️⃣  Test: Top downloads lezionari"
echo "GET $BASE_URL/category/lezionario?sort=-downloads&limit=3"
curl -s "$BASE_URL/category/lezionario?sort=-downloads&limit=3" | jq '.data.libri[] | {title, downloads, views}'
echo ""
echo ""

echo "✅ Test completati!"
echo ""
echo "📝 Note:"
echo "- Se jq non è installato: brew install jq (macOS) o apt-get install jq (Linux)"
echo "- Assicurati che il server sia in esecuzione su porta 5000"
echo "- Assicurati di aver importato i dati con: node seed-biblioteca-documenti.js"
