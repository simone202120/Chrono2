# Deployment Guide — Agile Planner

Guida passo-passo per il deploy su Vercel e configurazione Supabase.

## 1. Deploy su Vercel

### Prima volta
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

Segui il wizard:
- **Set up and deploy**: Yes
- **Which scope**: seleziona il tuo account
- **Link to existing project**: No
- **Project name**: agile-planner (o il nome che preferisci)
- **Directory**: `./`
- **Build command**: `npm run build`
- **Output directory**: `dist`

Al termine ottieni l'URL di produzione (es: `https://agile-planner-abc123.vercel.app`)

### Deploy successivi
```bash
cd frontend
vercel --prod
```

## 2. Configurare le Environment Variables su Vercel

Vai su [Vercel Dashboard](https://vercel.com/dashboard):

1. Seleziona il tuo progetto
2. **Settings** → **Environment Variables**
3. Aggiungi le seguenti variabili:

| Nome | Valore | Environment |
|------|--------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhb...` | Production, Preview, Development |
| `VITE_APP_URL` | `https://agile-planner-abc123.vercel.app` | Production |
| `VITE_VAPID_PUBLIC_KEY` | `BG5nS...` (se usi notifiche) | Production, Preview, Development |

**IMPORTANTE**: `VITE_APP_URL` deve essere l'URL esatto del tuo sito Vercel (senza trailing slash).

4. **Redeploy** il progetto dopo aver aggiunto le variabili (Vercel lo chiede automaticamente)

## 3. Configurare Supabase per Autenticazione

Questa sezione configura sia Google OAuth (metodo principale) che Magic Link (fallback).

### Passo 1: Site URL
1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. **Authentication** → **URL Configuration**
4. Imposta **Site URL** a: `https://agile-planner-abc123.vercel.app`
   (il tuo URL di produzione Vercel)

### Passo 2: Redirect URLs
Nella stessa pagina, aggiungi **Redirect URLs**:

```
http://localhost:3000/**
https://agile-planner-abc123.vercel.app/**
```

Il primo serve per lo sviluppo locale, il secondo per la produzione.

**Nota**: usa esattamente `/**` alla fine (due asterischi) per accettare qualsiasi path.

### Passo 3: Email Templates (opzionale)
In **Authentication** → **Email Templates** → **Confirm signup**:

Assicurati che l'email contenga il link con `{{ .ConfirmationURL }}` che ora punterà all'URL corretto.

### Passo 4: Configurare Google OAuth (CONSIGLIATO)

Google OAuth è il metodo di autenticazione principale. Configurazione richiesta:

#### 4.1. Creare OAuth App su Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `Agile Planner` (o come preferisci)
7. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://agile-planner-abc123.vercel.app
   ```
8. **Authorized redirect URIs**:
   ```
   http://localhost:3000
   https://agile-planner-abc123.vercel.app
   https://xxx.supabase.co/auth/v1/callback
   ```
   (sostituisci `xxx` con il tuo project ID Supabase)

9. Click **Create**
10. Copia **Client ID** e **Client Secret**

#### 4.2. Configurare Google Provider su Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. **Authentication** → **Providers**
3. Trova **Google** e clicca **Enable**
4. Incolla:
   - **Client ID** (da Google Cloud Console)
   - **Client Secret** (da Google Cloud Console)
5. **Save**

#### 4.3. Configurare OAuth Consent Screen

1. Torna su Google Cloud Console
2. **APIs & Services** → **OAuth consent screen**
3. User Type: **External** (poi click **Create**)
4. Compila:
   - App name: `Agile Planner`
   - User support email: la tua email
   - Developer contact: la tua email
5. **Scopes**: non aggiungere nessuno scope custom (usa solo quelli base)
6. **Test users**: aggiungi la tua email per testare mentre l'app è in "Testing" mode
7. **Save and Continue**

**Nota**: L'app rimarrà in "Testing" mode finché non la pubblichi. In Testing mode, solo gli utenti che aggiungi come "test users" potranno accedere. Per uso personale va benissimo così.

## 4. Testare l'Autenticazione

### Google OAuth (metodo principale)
1. Apri l'app su Vercel: `https://agile-planner-abc123.vercel.app`
2. Clicca **"Continua con Google"**
3. Seleziona il tuo account Google
4. Autorizza l'app
5. Dovresti essere reindirizzato all'app e autenticato ✅

### Magic Link (metodo fallback)

1. Apri l'app su Vercel: `https://agile-planner-abc123.vercel.app`
2. Inserisci la tua email
3. Controlla la tua casella email
4. Il link dovrebbe ora puntare a `https://agile-planner-abc123.vercel.app/...` ✅
5. Clicca il link e dovresti essere autenticato

## 5. Configurare Web Push Notifications (opzionale)

Se usi le notifiche push:

### VAPID Keys
Genera le chiavi se non le hai:
```bash
cd supabase/functions
node generate-vapid.js
```

### Supabase Secrets
Aggiungi i secrets all'Edge Function:
```bash
supabase secrets set VAPID_PUBLIC_KEY="BG5nS..."
supabase secrets set VAPID_PRIVATE_KEY="Z3x..."
supabase secrets set VAPID_SUBJECT="mailto:tua-email@example.com"
```

### Deploy Edge Function
```bash
supabase functions deploy notify-due-tasks
```

## 6. Verifica Build Locale

Prima di ogni deploy, verifica che il build funzioni:
```bash
cd frontend
npm run build
npm run preview
```

Apri `http://localhost:4173` e testa l'app.

## Troubleshooting

### Google OAuth non funziona / "Error 400: redirect_uri_mismatch"
- ✅ Verifica che l'URL di redirect su Google Cloud Console contenga `https://xxx.supabase.co/auth/v1/callback`
- ✅ Controlla che il dominio Vercel sia esattamente lo stesso in Google Cloud e Supabase
- ✅ Assicurati di aver abilitato il provider Google su Supabase Authentication → Providers
- ✅ Verifica che Client ID e Secret siano copiati correttamente (senza spazi)
- ✅ Controlla di essere registrato come "test user" se l'app è in Testing mode

### "Access blocked: This app's request is invalid"
- ✅ Completa l'OAuth Consent Screen su Google Cloud Console
- ✅ Aggiungi la tua email come test user
- ✅ Verifica che l'app sia in stato "Testing" (non "In production")

### Magic link punta ancora a localhost
- ✅ Verifica che `VITE_APP_URL` sia impostata su Vercel
- ✅ Verifica che il Site URL in Supabase sia il tuo dominio Vercel
- ✅ Hai fatto redeploy dopo aver aggiunto le variabili?
- ✅ Svuota la cache del browser e riprova

### "Invalid Redirect URL" error
- ✅ Controlla che l'URL in Supabase Redirect URLs sia esatto (con `/**`)
- ✅ Verifica che non ci sia trailing slash nel Site URL
- ✅ Aspetta 1-2 minuti dopo la modifica (Supabase impiega tempo a propagare)

### Build fallisce su Vercel
- ✅ Controlla i log in Vercel → Deployments → [il tuo deploy] → Build Logs
- ✅ Verifica che tutte le env vars siano impostate
- ✅ Prova a buildare localmente con `npm run build`

## Custom Domain (opzionale)

Se vuoi usare un dominio personalizzato (es: `agile.simone.dev`):

1. Vercel: Settings → Domains → Add Domain
2. Configura i DNS secondo le istruzioni Vercel
3. Una volta attivo, aggiorna:
   - `VITE_APP_URL` su Vercel → `https://agile.simone.dev`
   - Site URL in Supabase → `https://agile.simone.dev`
   - Redirect URLs in Supabase → aggiungi `https://agile.simone.dev/**`
   - Authorized JavaScript origins in Google Cloud → aggiungi `https://agile.simone.dev`
   - Authorized redirect URIs in Google Cloud → aggiungi `https://agile.simone.dev`

---

**Note**: Questo progetto è una PWA. Gli utenti possono installarlo sul telefono tramite il banner che appare dopo 3 giorni di utilizzo (vedi Task 4.4).
