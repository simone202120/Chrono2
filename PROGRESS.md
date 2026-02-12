# PROGRESS — Agile Planner

> Aggiornare dopo ogni sessione di sviluppo.

## Stato Attuale

**Fase:** Sprint 1 — Foundation in corso
**Sprint corrente:** Sprint 1 (Task 1.4)
**Ultimo aggiornamento:** 2026-02-12
**Branch:** `claude/sprint-1-01JatdRkfc3Pd9Mr5GoRL9t2`

---

## Sprint 1 — Foundation

- [x] Task 1.1: Setup progetto Vite + React + TypeScript + PWA *(completato 2026-02-12)*
  - ✅ Vite 7.3 + React 18.2 + TypeScript 5.9 strict
  - ✅ Tailwind CSS v4 con palette iOS (CSS variables)
  - ✅ vite-plugin-pwa + manifest configurato
  - ✅ ESLint + Prettier integrati
  - ✅ Struttura cartelle completa + tipi TypeScript
  - 📦 Build: 194 KB gzipped
- [x] Task 1.2: Setup Supabase + Schema DB *(completato 2026-02-12)*
  - ✅ Client Supabase in src/lib/supabase.ts
  - ✅ Migration SQL completa (tasks + push_subscriptions)
  - ✅ RLS policies configurate
  - ✅ Trigger updated_at attivo
  - ✅ Tipi TypeScript aggiornati (TaskStatus, recurrence)
  - 📋 Schema: 2 tabelle, 2 enum, 5 indici
- [x] Task 1.3: Autenticazione Magic Link *(completato 2026-02-12)*
  - ✅ authStore.ts con Zustand (initialize, signIn, signOut)
  - ✅ AuthPage.tsx con form email iOS-styled
  - ✅ Protezione route in App.tsx
  - ✅ Gestione onAuthStateChange e session persistence
  - 🔐 Magic link OTP via Supabase Auth
- [ ] Task 1.4: AppShell + BottomNav + Routing
- [ ] Task 1.5: Zustand Task Store + Supabase CRUD base
- [ ] Task 1.6: WeightBadge + TaskCard base

## Sprint 2 — Core Task

- [ ] Task 2.1: TaskForm — creazione task
- [ ] Task 2.2: BacklogPanel + lista
- [ ] Task 2.3: Filtri e ordinamento backlog
- [ ] Task 2.4: Swipe actions su TaskCard
- [ ] Task 2.5: TaskDetail bottom sheet
- [ ] Task 2.6: DayPage — Vista Giorno

## Sprint 3 — Calendario

- [ ] Task 3.1: WeekView — griglia settimana
- [ ] Task 3.2: Drag & Drop — backlog verso calendario
- [ ] Task 3.3: BacklogPage full screen
- [ ] Task 3.4: Riepilogo navigazione + link tra viste

## Sprint 4 — Avanzato

- [ ] Task 4.1: Task ricorrenti — creazione e gestione
- [ ] Task 4.2: Web Push — setup e subscription
- [ ] Task 4.3: Supabase Edge Function — cron notifiche
- [ ] Task 4.4: PWA — installabilità e offline

## Sprint 5 — Rifinitura

- [ ] Task 5.1: Animazioni e micro-interazioni
- [ ] Task 5.2: Gestione errori e feedback utente
- [ ] Task 5.3: Settings e preferenze utente
- [ ] Task 5.4: Deploy + documentazione finale

---

## Avanzamento

```
Sprint 1  [███░░░] 3/6   (50%)
Sprint 2  [░░░░░░] 0/6   (0%)
Sprint 3  [░░░░░░] 0/4   (0%)
Sprint 4  [░░░░░░] 0/4   (0%)
Sprint 5  [░░░░░░] 0/4   (0%)

TOTALE    [███░░░] 3/24 task  (13%)
```

---

## Note e Decisioni

| Data | Decisione | Motivo |
|------|-----------|--------|
| 2025-02-12 | PWA invece di React Native | Semplicità deploy, no store |
| 2025-02-12 | Supabase Magic Link | No password da gestire |
| 2025-02-12 | @dnd-kit invece di react-beautiful-dnd | Migliore supporto touch/mobile |
| 2025-02-12 | Zustand invece di Redux | Meno boilerplate per progetto personale |
| 2026-02-12 | Tailwind CSS v4 con CSS variables | Compatibilità con nuova versione, no extend colors |
| 2026-02-12 | Branch `claude/sprint-1-*` | Sistema GitHub richiede prefisso claude/ + session ID |

---

## Issues & Bug Noti

_Nessuno al momento_
