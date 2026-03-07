# 🔧 Risoluzione Errore MongoDB Atlas - IP Whitelist

## ❌ Errore Attuale

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Soluzioni

### Opzione 1: Whitelist IP Corrente (Raccomandato per Sviluppo)

1. **Vai su MongoDB Atlas**
   - Accedi a https://cloud.mongodb.com/

2. **Seleziona il tuo cluster**
   - Clicca su "Database" nel menu laterale
   - Trova il cluster `atlas-13kn8h-shard-0`

3. **Network Access**
   - Clicca su "Network Access" nel menu laterale (sotto "Security")

4. **Aggiungi IP**
   - Clicca sul pulsante "ADD IP ADDRESS"
   - Hai due opzioni:

   **A) IP Specifico (Sicuro ma richiede aggiornamenti)**
   ```
   - Seleziona "Add Current IP Address"
   - Oppure inserisci manualmente il tuo IP
   - Clicca "Confirm"
   ```

   **B) Tutti gli IP (Comodo per sviluppo, meno sicuro)**
   ```
   - Inserisci: 0.0.0.0/0
   - Descrizione: "Allow All IPs - Development"
   - ⚠️ NON usare in produzione!
   - Clicca "Confirm"
   ```

5. **Attendi 2-3 minuti** per l'applicazione delle modifiche

6. **Riavvia il server**
   ```bash
   npm run dev
   ```

### Opzione 2: Scopri il Tuo IP Corrente

Se non sei sicuro del tuo IP:

**MacOS/Linux:**
```bash
curl ifconfig.me
```

**Oppure visita:**
- https://whatismyipaddress.com/
- https://www.whatismyip.com/

Poi aggiungi questo IP in MongoDB Atlas.

### Opzione 3: Usa IP Dinamico (Consigliato per Laptop)

Se lavori da diversi luoghi (casa, ufficio, caffè):

1. Vai su MongoDB Atlas → Network Access
2. Clicca "ADD IP ADDRESS"
3. Seleziona "ALLOW ACCESS FROM ANYWHERE"
4. Oppure aggiungi un range di IP: `xxx.xxx.0.0/16`

## 🔍 Verifica Connessione

Dopo aver whitelisted l'IP:

```bash
# Test connessione MongoDB
node -e "const mongoose = require('mongoose'); require('dotenv').config({ path: './config.env' }); const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); mongoose.connect(DB).then(() => { console.log('✅ Connected to MongoDB!'); process.exit(0); }).catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });"
```

## 📝 Checklist Risoluzione

- [ ] Accesso a MongoDB Atlas
- [ ] Network Access → ADD IP ADDRESS
- [ ] IP whitelisted (corrente o 0.0.0.0/0)
- [ ] Atteso 2-3 minuti
- [ ] Server riavviato
- [ ] Test connessione riuscito

## 🎯 Verifica Finale

Il server dovrebbe mostrare:

```
✅ DB connection successful!
🚀 Server is running on port 5000
```

## ⚠️ Note Importanti

1. **0.0.0.0/0 solo per sviluppo**: In produzione usa IP specifici
2. **IP Dinamici**: Se il tuo IP cambia spesso, considera un servizio di IP statico
3. **VPN**: Se usi una VPN, l'IP potrebbe cambiare quando la attivi/disattivi
4. **Firewall**: Verifica che non blocchi le connessioni MongoDB (porta 27017)

## 🔐 Sicurezza Produzione

Per produzione:

1. Usa IP fissi del server
2. Non usare 0.0.0.0/0
3. Limita accessi a IP specifici
4. Usa VPC Peering se disponibile
5. Abilita autenticazione database
6. Monitora accessi sospetti

## 🆘 Se Continua a Non Funzionare

1. **Verifica credenziali**: Controlla username/password in `config.env`
2. **Verifica database name**: Assicurati che il nome DB sia corretto
3. **Verifica cluster**: Il cluster deve essere attivo (non in pausa)
4. **Contatta Support**: support@mongodb.com

## 📞 Link Utili

- [MongoDB Atlas IP Whitelist](https://www.mongodb.com/docs/atlas/security-whitelist/)
- [Troubleshooting Connection](https://www.mongodb.com/docs/atlas/troubleshoot-connection/)
- [Network Access Setup](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
