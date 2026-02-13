# Supabase Edge Functions

## notify-due-tasks

Edge Function che invia notifiche push per task in scadenza oggi o domani.

### Setup

1. **Genera VAPID keys** (se non l'hai già fatto):
   ```bash
   cd frontend
   node scripts/generate-vapid.js
   ```

2. **Configura i secrets in Supabase**:

   Vai su Supabase Dashboard → Settings → Edge Functions → Secrets e aggiungi:

   ```
   VAPID_PUBLIC_KEY=BNzy...
   VAPID_PRIVATE_KEY=Hu1P...
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

3. **Deploy della funzione**:
   ```bash
   supabase functions deploy notify-due-tasks
   ```

4. **Abilita il cron schedule** (automatico se `config.toml` è presente):

   Il cron esegue la funzione ogni ora (minuto 0).

### Test manuale

Puoi testare la funzione manualmente con:

```bash
supabase functions invoke notify-due-tasks --method POST
```

Oppure via HTTP:

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/notify-due-tasks \
  -H "Authorization: Bearer <anon-key>"
```

### Funzionamento

1. Query tasks con `due_date` = oggi o domani
2. Filtra task non completati (`status != done, postponed`)
3. Raggruppa per utente
4. Per ogni utente, recupera le push subscriptions
5. Invia notifica push a ogni subscription
6. Se subscription è scaduta (410/404), la rimuove dal DB

### Logs

Per vedere i log della funzione:

```bash
supabase functions logs notify-due-tasks
```

Oppure in Supabase Dashboard → Edge Functions → notify-due-tasks → Logs

### Formato notifica

```json
{
  "title": "Scadenza oggi: Nome task",
  "body": "+2 altri impegni in scadenza",
  "icon": "/pwa-192x192.png",
  "badge": "/pwa-192x192.png",
  "data": {
    "taskId": "uuid",
    "url": "/"
  }
}
```

### Troubleshooting

**Notifiche non arrivano:**
- Verifica che i VAPID secrets siano configurati correttamente
- Controlla i logs della funzione
- Verifica che l'utente abbia una subscription valida in `push_subscriptions`
- Testa manualmente con `supabase functions invoke`

**Subscription scadute:**
- La funzione rimuove automaticamente le subscription scadute (HTTP 410/404)
- L'utente dovrà ri-autorizzare le notifiche nell'app

**Cron non si attiva:**
- Verifica che `config.toml` sia presente
- Il cron è abilitato solo per progetti Supabase Pro/Team
- Per progetti Free, esegui manualmente con un servizio esterno (cron-job.org, GitHub Actions, etc.)
