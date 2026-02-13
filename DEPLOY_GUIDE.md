# Deploy Guide — Agile Planner

Guida completa per il deploy dell'applicazione Agile Planner su Vercel + Supabase.

---

## Prerequisiti

- Account [Vercel](https://vercel.com) (gratuito)
- Account [Supabase](https://supabase.com) (gratuito)
- [Node.js](https://nodejs.org) 18+ installato localmente
- Repository GitHub connesso

---

## 1. Setup Supabase

### 1.1 Crea un nuovo progetto Supabase

1. Vai su [app.supabase.com](https://app.supabase.com)
2. Clicca **New Project**
3. Scegli nome, password database, e regione (preferibilmente EU per GDPR)
4. Attendi il provisioning del database (~2 minuti)

### 1.2 Esegui la migration SQL

1. Vai su **SQL Editor** nella sidebar
2. Clicca **New Query**
3. Copia e incolla il contenuto di `scripts/migration.sql`
4. Clicca **Run** per creare tabelle, indici, RLS policies e trigger

### 1.3 Configura autenticazione

1. Vai su **Authentication** → **Providers**
2. Attiva **Email** provider
3. In **Email Templates** → **Magic Link**:
   - Personalizza il messaggio (opzionale)
   - Conferma che il redirect URL punti al tuo dominio production

### 1.4 Ottieni le credenziali

1. Vai su **Project Settings** → **API**
2. Copia questi valori:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbG...` (chiave pubblica)

---

## 2. Generazione VAPID Keys

Le VAPID keys sono necessarie per le notifiche push.

### 2.1 Genera le chiavi localmente

```bash
cd frontend
npm run generate-vapid
```

Output:
```
VAPID_PUBLIC_KEY=BAbC...xyz
VAPID_PRIVATE_KEY=kL9m...nop
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2.2 Salva le chiavi

- **Public key**: va in `.env.production` (frontend)
- **Private key**: va nei **Secrets** di Supabase (per Edge Function)
- **Subject**: tuo indirizzo email (per contatti in caso di problemi)

⚠️ **Non committare mai le chiavi private su Git!**

---

## 3. Deploy Supabase Edge Function

### 3.1 Installa Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login e link al progetto

```bash
supabase login
supabase link --project-ref your-project-ref
```

(Trova il `project-ref` in **Project Settings** → **General** → **Reference ID**)

### 3.3 Configura i secrets per la Edge Function

```bash
supabase secrets set VAPID_PUBLIC_KEY="BAbC...xyz"
supabase secrets set VAPID_PRIVATE_KEY="kL9m...nop"
supabase secrets set VAPID_SUBJECT="mailto:your-email@example.com"
```

### 3.4 Deploy della Edge Function

```bash
supabase functions deploy notify-due-tasks
```

Verifica:
```bash
supabase functions list
```

Dovresti vedere `notify-due-tasks` con stato **ACTIVE**.

### 3.5 Configura il cron job

Il cron è già configurato in `supabase/functions/notify-due-tasks/config.toml`:

```toml
[cron]
schedule = "0 * * * *"  # Ogni ora
```

Per verificare che il cron sia attivo:
- Vai su **Database** → **Cron Jobs** nella dashboard Supabase
- Dovresti vedere `notify-due-tasks` schedulato

---

## 4. Deploy Frontend su Vercel

### 4.1 Prepara le variabili d'ambiente

Crea un file `.env.production` in `frontend/`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_VAPID_PUBLIC_KEY=BAbC...xyz
```

⚠️ **Questo file non va committato!** (già in `.gitignore`)

### 4.2 Deploy su Vercel

Opzione A: **Via GitHub**

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa il repository GitHub
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Aggiungi le **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY`
5. Clicca **Deploy**

Opzione B: **Via CLI**

```bash
cd frontend
npm install -g vercel
vercel
```

Segui il wizard e aggiungi le env variables quando richiesto.

### 4.3 Verifica il deploy

Una volta completato, Vercel ti darà un URL tipo:

```
https://agile-planner-abc123.vercel.app
```

Testa:
- ✅ Login con magic link funziona
- ✅ Creazione task funziona
- ✅ Drag & drop funziona
- ✅ Notifiche push (permesso richiesto)

---

## 5. Configurazione dominio custom (opzionale)

### 5.1 Aggiungi dominio su Vercel

1. Vai su **Project Settings** → **Domains**
2. Aggiungi il tuo dominio (es: `agileplanner.example.com`)
3. Configura i DNS secondo le istruzioni Vercel (solitamente record A o CNAME)

### 5.2 Aggiorna Supabase redirect URL

1. Vai su **Authentication** → **URL Configuration**
2. In **Redirect URLs**, aggiungi:
   ```
   https://agileplanner.example.com
   https://agileplanner.example.com/**
   ```
3. Salva

---

## 6. Verifica PWA

### 6.1 Lighthouse

1. Apri l'app in Chrome
2. F12 → **Lighthouse**
3. Seleziona **Progressive Web App** + **Performance**
4. Clicca **Generate Report**

Target:
- ✅ PWA Score: **> 90**
- ✅ Installabile
- ✅ Service Worker attivo
- ✅ Manifest valido
- ✅ HTTPS attivo (su Vercel è automatico)

### 6.2 Test installazione

**Desktop (Chrome):**
- Dovresti vedere l'icona "Install" nella barra degli indirizzi
- Clicca e conferma

**Mobile (iOS Safari):**
- Clicca **Share** → **Add to Home Screen**
- L'app si apre come PWA standalone

**Mobile (Android Chrome):**
- Dovresti vedere il banner di installazione automatico
- Oppure: Menu → **Add to Home Screen**

---

## 7. Monitoring e Manutenzione

### 7.1 Vercel Analytics

- Vai su **Analytics** nella dashboard Vercel
- Monitora traffico, performance, errori

### 7.2 Supabase Logs

- **Database** → **Logs**: query lente, errori SQL
- **Edge Functions** → **Logs**: esecuzioni cron, errori push

### 7.3 Notifiche Push

Per testare manualmente:

```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/notify-due-tasks \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

(Service Role Key in **Project Settings** → **API**)

---

## 8. Troubleshooting

### Build fallisce su Vercel

Errore: `Command "npm run build" exited with 1`

Soluzioni:
1. Verifica che tutte le dipendenze siano in `package.json`
2. Controlla i TypeScript errors:
   ```bash
   npm run build
   ```
3. Assicurati che le env variables siano configurate

### Magic Link non arriva

1. Controlla spam
2. Vai su Supabase **Authentication** → **Logs**
3. Verifica rate limits (max 4 email/ora in free tier)

### Notifiche push non funzionano

1. Verifica che l'utente abbia dato il permesso
2. Controlla i logs della Edge Function
3. Controlla che VAPID keys siano corrette:
   ```bash
   supabase secrets list
   ```

### Service Worker non si aggiorna

1. In Chrome DevTools → **Application** → **Service Workers**
2. Clicca **Unregister**
3. Ricarica la pagina (hard refresh: Ctrl+Shift+R)

---

## 9. Next Steps

- [ ] Configura custom domain
- [ ] Abilita Vercel Analytics
- [ ] Configura alerting per errori critici
- [ ] Documenta onboarding per nuovi utenti
- [ ] Considera backup automatici DB (Supabase Backups)

---

## Supporto

Per problemi o domande:
- GitHub Issues: [simone202120/Chrono2](https://github.com/simone202120/Chrono2)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
