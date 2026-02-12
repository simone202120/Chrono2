# PROGRESS — Agile Planner

> Aggiornare dopo ogni sessione di sviluppo.

## Stato Attuale

**Fase:** Sprint 2 — Core Task in corso
**Sprint corrente:** Sprint 2 (Task 2.5)
**Ultimo aggiornamento:** 2026-02-12
**Branch:** `claude/sprint-2-01JatdRkfc3Pd9Mr5GoRL9t2`

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
- [x] Task 1.4: AppShell + BottomNav + Routing *(completato 2026-02-12)*
  - ✅ AppShell.tsx con header dinamico e safe areas iOS
  - ✅ BottomNav.tsx con 3 tab (Oggi, Settimana, Backlog)
  - ✅ React Router v6 configurato
  - ✅ Pagine stub: DayPage, WeekPage, BacklogPage
  - 🎨 Icone lucide-react (Calendar, CalendarDays, List)
- [x] Task 1.5: Zustand Task Store + Supabase CRUD base *(completato 2026-02-12)*
  - ✅ taskStore.ts con Zustand (SSOT per tasks)
  - ✅ CRUD completo: fetchTasks, createTask, updateTask, deleteTask
  - ✅ Optimistic updates con rollback automatico
  - ✅ Error handling con user feedback
  - 📊 Tutte le query Supabase passano dal store
- [x] Task 1.6: WeightBadge + TaskCard base *(completato 2026-02-12)*
  - ✅ WeightBadge.tsx (pill con colore peso 1-5)
  - ✅ TaskCard.tsx con tutti gli indicatori visivi
  - ✅ Icone: ⚠️ scadenza vicina, 🔁 ricorrente
  - ✅ Stato completato: grigio + strikethrough
  - ✅ Demo funzionante in DayPage
  - 🎨 iOS-styled con transizione tap

## Sprint 2 — Core Task

- [x] Task 2.1: TaskForm — creazione task *(completato 2026-02-12)*
  - ✅ TaskForm.tsx bottom sheet completo
  - ✅ Tutti i campi: titolo, note, peso, scadenza, destinazione
  - ✅ Selezione peso con 5 pill colorati
  - ✅ Toggle Backlog / Calendario con campi condizionali
  - ✅ Date/time pickers nativi
  - ✅ CTA adattivo ("Salva nel Backlog" / "Schedula")
  - ✅ Integrato con taskStore.createTask
- [x] Task 2.2: BacklogPanel + lista *(completato 2026-02-12)*
  - ✅ BacklogPanel.tsx con header + contatore dinamico
  - ✅ Lista task backlog ordinati per peso (desc)
  - ✅ Empty state: icona + testo + CTA
  - ✅ Loading skeleton con 3 cards animate
  - ✅ Pulsanti "Peso ↓" e "Filtri" nell'header
  - ✅ Footer CTA "+ Aggiungi al backlog"
  - ✅ Animazione staggered fade-in lista
  - ✅ Integrato in BacklogPage con fetchTasks
- [x] Task 2.3: Filtri e ordinamento backlog *(completato 2026-02-12)*
  - ✅ BacklogFilters.tsx bottom sheet (250 lines)
  - ✅ 4 opzioni ordinamento: peso ↑↓, scadenza, data aggiunta
  - ✅ 4 filtri: in scadenza (7gg), senza data, alta priorità (4-5), ricorrenti
  - ✅ Pulsanti Applica (blu) + Reset (outline)
  - ✅ Badge rosso su pulsante filtri con contatore attivi
  - ✅ Logica sort/filter integrata in BacklogPanel con useMemo
  - ✅ Pulsante sort mostra label dinamica (Peso↓, Peso↑, etc.)
  - ✅ Filtri salvati in stato locale
- [x] Task 2.4: Swipe actions su TaskCard *(completato 2026-02-12)*
  - ✅ SwipeableTaskCard.tsx wrappa TaskCard con gesture
  - ✅ Swipe sinistra → elimina (icona Trash2 rossa)
  - ✅ Swipe destra → completa (icona CheckCircle2 verde)
  - ✅ Threshold 80px per attivazione azione
  - ✅ Conferma elimina con window.confirm
  - ✅ Animazione smooth con spring back se sotto threshold
  - ✅ completeTask aggiunto a taskStore
  - ✅ Integrato in BacklogPanel e DayPage
  - ✅ Disabled on completed tasks
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
Sprint 1  [██████] 6/6   (100%) ✅
Sprint 2  [████░░] 4/6   (67%)
Sprint 3  [░░░░░░] 0/4   (0%)
Sprint 4  [░░░░░░] 0/4   (0%)
Sprint 5  [░░░░░░] 0/4   (0%)

TOTALE    [██████████] 10/24 task  (42%)
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
