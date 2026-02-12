# ARCHITECTURE — Agile Planner

## Stack Tecnologico

| Layer | Tecnologia | Versione | Motivo |
|-------|-----------|----------|--------|
| Frontend Framework | React + Vite + TypeScript | React 18, Vite 5 | Veloce, PWA-ready, type-safe |
| Styling | Tailwind CSS + shadcn/ui | Tailwind 3 | iOS-like pulito, componenti accessibili |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | v6 | Leggero, mobile-friendly, touch support |
| State Management | Zustand | v4 | Semplice, no boilerplate, persistenza facile |
| Date Management | date-fns | v3 | Tree-shakeable, leggero |
| Backend/Auth | Supabase | v2 SDK | Auth + PostgreSQL + Realtime + Edge Functions |
| Push Notifications | Web Push API + Supabase Edge Functions | — | Notifiche native PWA |
| PWA | vite-plugin-pwa | v0.19 | Service Worker + Manifest automatici |
| Deploy | Vercel | — | Zero config, HTTPS, preview deploy |

## Diagramma Architettura

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER / PWA                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              React App (Vite + TS)               │   │
│  │                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │  Pages   │  │Components│  │  Zustand     │   │   │
│  │  │ /giorno  │  │TaskCard  │  │  Store       │   │   │
│  │  │ /settim. │  │Backlog   │  │  (tasks,     │   │   │
│  │  │ /backlog │  │Calendar  │  │   ui, auth)  │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  │                                                   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │          Supabase JS SDK v2               │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────┐                                    │
│  │ Service Worker │ ← vite-plugin-pwa                  │
│  │ (offline cache │                                    │
│  │  + push notify)│                                    │
│  └────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS / WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                           │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth        │  │  PostgreSQL  │  │ Edge Functions│ │
│  │  (email/     │  │  (tasks,     │  │ cron-notify   │ │
│  │   magic link)│  │   push_subs) │  │ (ogni ora)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐                                      │
│  │  Row Level   │ ← ogni user vede solo i suoi task    │
│  │  Security    │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Web Push Protocol
                          ▼
                   ┌─────────────┐
                   │  Browser    │
                   │  Push Service│
                   │ (FCM/APNs)  │
                   └─────────────┘
```

## Schema Database (PostgreSQL / Supabase)

```sql
-- Enum stati task
CREATE TYPE task_status AS ENUM ('backlog', 'scheduled', 'done', 'postponed');

-- Enum tipi ricorrenza
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'monthly', 'custom');

-- Tabella principale task
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contenuto
  title         TEXT NOT NULL,
  description   TEXT,
  weight        SMALLINT NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 5),

  -- Date
  due_date      DATE,                    -- scadenza (per alert)
  scheduled_at  TIMESTAMPTZ,             -- quando lo fai (NULL = backlog)
  completed_at  TIMESTAMPTZ,             -- quando completato

  -- Stato
  status        task_status NOT NULL DEFAULT 'backlog',

  -- Ricorrenza
  is_recurring  BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence    JSONB,
  -- es: { "type": "weekly", "days": [1, 3, 5], "until": "2025-12-31", "interval": 1 }
  parent_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  -- NULL per task normali, UUID per istanze ricorrenti

  -- Metadati
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_scheduled_at ON tasks(user_id, scheduled_at);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);

-- RLS: ogni utente vede solo i suoi task
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_tasks" ON tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Push subscriptions per notifiche
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  keys        JSONB NOT NULL,  -- { p256dh, auth }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_push_subs" ON push_subscriptions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Struttura Frontend

```
frontend/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + Auth provider
├── types/
│   └── task.ts                 # Tipi TypeScript (Task, TaskStatus, ecc.)
├── lib/
│   ├── supabase.ts             # Client Supabase
│   ├── notifications.ts        # Web Push setup
│   └── utils.ts                # Helper date, colori peso, ecc.
├── store/
│   ├── taskStore.ts            # Zustand: tasks CRUD + filtri
│   └── authStore.ts            # Zustand: stato autenticazione
├── hooks/
│   ├── useTasks.ts             # Hook per operazioni task
│   ├── useCalendar.ts          # Hook per navigazione calendario
│   └── useNotifications.ts     # Hook per push subscriptions
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Layout wrapper con nav
│   │   └── BottomNav.tsx       # Navigazione bottom bar
│   ├── task/
│   │   ├── TaskCard.tsx        # Card task (backlog + calendario)
│   │   ├── TaskForm.tsx        # Form crea/modifica task
│   │   ├── TaskDetail.tsx      # Sheet dettaglio task
│   │   └── WeightBadge.tsx     # Badge peso colorato
│   ├── calendar/
│   │   ├── DayView.tsx         # Vista giorno
│   │   ├── WeekView.tsx        # Vista settimana
│   │   └── DayColumn.tsx       # Colonna singolo giorno
│   ├── backlog/
│   │   ├── BacklogPanel.tsx    # Pannello backlog
│   │   ├── BacklogFilters.tsx  # Filtri e ordinamento
│   │   └── BacklogItem.tsx     # Item draggable backlog
│   └── ui/                     # Componenti shadcn/ui
└── pages/
    ├── AuthPage.tsx            # Login / Magic Link
    ├── DayPage.tsx             # Vista principale giorno
    ├── WeekPage.tsx            # Vista settimana
    └── BacklogPage.tsx         # Backlog full screen
```

## Flusso Notifiche Push

```
1. Utente installa PWA → Service Worker registrato
2. Utente accetta notifiche → browser genera subscription (endpoint + keys)
3. Frontend salva subscription in push_subscriptions su Supabase
4. Edge Function (cron ogni ora):
   a. SELECT tasks WHERE due_date = oggi OR due_date = domani
      AND status != 'done'
   b. Per ogni task → fetch push_subscription dell'utente
   c. Invia Web Push con titolo task + scadenza
5. Service Worker riceve push → mostra notifica nativa
```

## Flusso Drag & Drop

```
1. Utente tiene premuto su BacklogItem (@dnd-kit DragStart)
2. Overlay preview segue il dito
3. Utente rilascia su DayColumn o slot orario (DragEnd)
4. taskStore.scheduleTask(taskId, date, time) chiamato
5. Ottimistic update → Supabase UPDATE in background
6. Task sparisce dal backlog, appare nel calendario
```

## Alternative Considerate

| Alternativa | Motivo scartata |
|-------------|-----------------|
| Expo / React Native | Troppo complesso per uso personale; PWA sufficiente |
| Firebase | Supabase è open source, SQL più flessibile |
| Redux | Zustand è molto più semplice per questo caso d'uso |
| FullCalendar | Eccessivo; build custom migliore per il design iOS-like |
| Capacitor | Aggiunge complessità per funzionalità non necessarie |
