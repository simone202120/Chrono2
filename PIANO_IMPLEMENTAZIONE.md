# PIANO DI IMPLEMENTAZIONE — Agile Planner

> Task atomici da 2-3 ore, con prompt pronti per Claude Code.
> Totale stimato: 30 sessioni (~75-90 ore)

## Strategia Git & Branching

**Un branch per Sprint**, commit + push dopo ogni task completato:

- **Sprint 1**: branch `feature/sprint-1` → 6 task → 6 commit → 1 PR
- **Sprint 2**: branch `feature/sprint-2` → 6 task → 6 commit → 1 PR
- **Sprint 3**: branch `feature/sprint-3` → 4 task → 4 commit → 1 PR
- **Sprint 4**: branch `feature/sprint-4` → 4 task → 4 commit → 1 PR
- **Sprint 5**: branch `feature/sprint-5` → 4 task → 4 commit → 1 PR

**Workflow per ogni Sprint:**
1. Crea branch `feature/sprint-N` da `main`
2. Per ogni task: sviluppo → commit → push
3. A fine sprint: verifica → PR → merge in `main`

**Commit message:** `feat(N.M): descrizione task` (es: `feat(1.1): setup vite + react + typescript`)

---

## SPRINT 1 — Foundation (6 sessioni)

Setup progetto, autenticazione, struttura base, tema iOS.

---

### Task 1.1: Setup progetto Vite + React + TypeScript + PWA

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Nessuna |

**Deliverable:**
- [ ] Vite + React + TypeScript configurato
- [ ] Tailwind CSS installato e configurato con palette iOS
- [ ] shadcn/ui inizializzato
- [ ] vite-plugin-pwa configurato (manifest base)
- [ ] ESLint + Prettier configurati
- [ ] Struttura cartelle `src/` creata

**Prompt per Claude Code:**
```
Crea un progetto Vite + React 18 + TypeScript chiamato "agile-planner".
Configura:
1. Tailwind CSS con palette colori iOS custom (vedi DESIGN_SPEC.md sezione Palette)
2. shadcn/ui con tema "neutral"
3. vite-plugin-pwa con manifest: nome "Agile Planner", colore tema #007AFF, icone placeholder
4. ESLint + Prettier con regole standard
5. Struttura cartelle: src/components/, src/pages/, src/store/, src/hooks/, src/lib/, src/types/
6. File src/types/task.ts con tipi TypeScript: Task, TaskStatus (enum), RecurrenceConfig
Riferimento design: DESIGN_SPEC.md
```

**File coinvolti:**
- `frontend/` (nuovo — intera cartella)
- `frontend/src/types/task.ts` (nuovo)

---

### Task 1.2: Setup Supabase + Schema DB

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.1 |

**Deliverable:**
- [ ] Client Supabase configurato in `src/lib/supabase.ts`
- [ ] Migration SQL: tabelle `tasks` e `push_subscriptions`
- [ ] RLS policies attive
- [ ] Trigger `updated_at` attivo
- [ ] `.env.example` con variabili Supabase

**Prompt per Claude Code:**
```
Configura Supabase nel progetto agile-planner:
1. Crea src/lib/supabase.ts con createClient usando variabili d'ambiente
2. Crea scripts/migration.sql con schema completo da ARCHITECTURE.md (tabelle tasks, push_subscriptions, enum, indici, RLS, trigger)
3. Crea frontend/.env.example con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
4. Aggiungi scripts/migration.sql a .gitignore (no, in realtà tienilo — non contiene segreti)
Usa TypeScript strict.
```

**File coinvolti:**
- `frontend/src/lib/supabase.ts` (nuovo)
- `scripts/migration.sql` (nuovo)
- `frontend/.env.example` (nuovo)

---

### Task 1.3: Autenticazione Magic Link

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.2 |

**Deliverable:**
- [ ] Pagina `AuthPage.tsx` con form email + pulsante magic link
- [ ] `authStore.ts` Zustand con stato user/session
- [ ] Protezione route: redirect a `/auth` se non loggato
- [ ] Gestione callback magic link (URL hash)
- [ ] Design iOS-like (input grande, CTA blu)

**Prompt per Claude Code:**
```
Implementa autenticazione Magic Link Supabase in agile-planner:
1. src/store/authStore.ts — Zustand store con: user, session, signIn(email), signOut(), initialize()
2. src/pages/AuthPage.tsx — pagina login con: logo app, input email styled iOS, pulsante "Invia link di accesso" (#007AFF), messaggio conferma dopo invio
3. src/App.tsx — router con protezione: se !user → <AuthPage/>, else → <AppShell/>
4. Gestione onAuthStateChange per auto-login da magic link
Stile: DESIGN_SPEC.md palette, font system-ui, tutto centrato verticalmente su mobile
```

**File coinvolti:**
- `frontend/src/store/authStore.ts` (nuovo)
- `frontend/src/pages/AuthPage.tsx` (nuovo)
- `frontend/src/App.tsx` (modifica)

---

### Task 1.4: AppShell + BottomNav + Routing

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.3 |

**Deliverable:**
- [ ] `AppShell.tsx` con header dinamico e safe areas iOS
- [ ] `BottomNav.tsx` con 3 tab: Oggi / Settimana / Backlog
- [ ] React Router con rotte: `/`, `/settimana`, `/backlog`
- [ ] Pagine stub per ogni rotta
- [ ] Animazione transizione pagine (slide horizontal)

**Prompt per Claude Code:**
```
Crea il layout shell dell'app agile-planner:
1. src/components/layout/AppShell.tsx — wrapper con: header (titolo dinamico, pulsante +, navigazione data ◀▶), contenuto scrollabile, safe area bottom per iOS
2. src/components/layout/BottomNav.tsx — bottom navigation con icone lucide-react: Calendar (Oggi), CalendarDays (Settimana), List (Backlog). Tab attivo = colore #007AFF, inattivo = #8E8E93. Altezza 83px con padding-bottom safe area.
3. React Router v6: / → DayPage, /settimana → WeekPage, /backlog → BacklogPage
4. Pagine stub con titolo centrato
5. Transizione slide: framer-motion o CSS transition-all
Riferimento: DESIGN_SPEC.md sezione Layout
```

**File coinvolti:**
- `frontend/src/components/layout/AppShell.tsx` (nuovo)
- `frontend/src/components/layout/BottomNav.tsx` (nuovo)
- `frontend/src/pages/DayPage.tsx` (stub)
- `frontend/src/pages/WeekPage.tsx` (stub)
- `frontend/src/pages/BacklogPage.tsx` (stub)

---

### Task 1.5: Zustand Task Store + Supabase CRUD base

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.2 |

**Deliverable:**
- [ ] `taskStore.ts` con: tasks[], fetchTasks(), addTask(), updateTask(), deleteTask()
- [ ] Ottimistic updates (aggiorna stato locale prima di Supabase)
- [ ] Filtri nello store: getBacklogTasks(), getScheduledTasksForDate(date)
- [ ] Gestione errori con toast

**Prompt per Claude Code:**
```
Crea src/store/taskStore.ts — Zustand store completo per i task:

Stato: tasks: Task[], isLoading: boolean, error: string | null
Azioni:
- fetchTasks(): carica tutti i task dell'utente da Supabase
- addTask(input: CreateTaskInput): Promise<Task> — ottimistic update
- updateTask(id, changes): Promise<void> — ottimistic update  
- deleteTask(id): Promise<void>
- scheduleTask(id, scheduledAt: Date): Promise<void> — sposta da backlog a calendario
- moveToBacklog(id): Promise<void> — rimuove scheduled_at, status → backlog
- completeTask(id): Promise<void> — status → done, completedAt = now
- postponeTask(id, newDate: Date): Promise<void>

Selectors (useMemo):
- backlogTasks: task con status === backlog, ordinati per weight desc
- getTasksForDate(date: Date): task scheduled_at nel giorno specificato

Tipi: src/types/task.ts con Task, CreateTaskInput, TaskStatus
Usa ottimistic updates: aggiorna array locale prima, rollback se Supabase fallisce.
```

**File coinvolti:**
- `frontend/src/store/taskStore.ts` (nuovo)
- `frontend/src/types/task.ts` (modifica/completa)

---

### Task 1.6: WeightBadge + TaskCard base

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.4, 1.5 |

**Deliverable:**
- [ ] `WeightBadge.tsx` — pallino colorato + numero
- [ ] `TaskCard.tsx` — card completa con tutti gli elementi
- [ ] Icona ⚠️ automatica se scadenza entro 48h
- [ ] Icona 🔁 per task ricorrenti
- [ ] Stato completato (grigio + barrato)
- [ ] `src/lib/utils.ts` con helper: getWeightColor(), isNearDue(), formatDueDate()

**Prompt per Claude Code:**
```
Crea i componenti task core per agile-planner:

1. src/lib/utils.ts:
   - getWeightColor(weight: 1-5): string — restituisce hex da DESIGN_SPEC.md tabella colori peso
   - isNearDue(dueDate: Date): boolean — true se scadenza entro 48h
   - formatDueDate(date: Date): string — "oggi", "domani", "12 feb"
   - formatScheduledTime(dt: Date): string — "09:00"

2. src/components/task/WeightBadge.tsx:
   Props: weight: number
   Render: pallino colorato (getWeightColor) + numero, pill shape 28x20px, font 11px medium

3. src/components/task/TaskCard.tsx:
   Props: task: Task, variant: 'calendar' | 'backlog', onTap, onComplete, onMoveToBacklog
   Layout (vedi DESIGN_SPEC.md sezione TaskCard):
   - Sinistra: WeightBadge
   - Centro: titolo (medium 15px) + riga info (ora se calendar, scadenza, grigio 13px)
   - Destra: icona ⚠️ se isNearDue + icona 🔁 se ricorrente
   - Stato done: opacity 0.5, titolo line-through, testo "completato"
   Border radius 12px, shadow leggero, background white
```

**File coinvolti:**
- `frontend/src/lib/utils.ts` (nuovo)
- `frontend/src/components/task/WeightBadge.tsx` (nuovo)
- `frontend/src/components/task/TaskCard.tsx` (nuovo)

---

## SPRINT 2 — Core Task (8 sessioni)

Form task, backlog completo, filtri, azioni swipe.

---

### Task 2.1: TaskForm — creazione task

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Sprint 1 completo |

**Deliverable:**
- [ ] `TaskForm.tsx` — bottom sheet con tutti i campi
- [ ] Selezione peso con pill colorati
- [ ] Toggle Backlog / Calendario con campi condizionali
- [ ] Date picker iOS-like
- [ ] CTA adattivo ("Salva nel Backlog" / "Schedula")
- [ ] Validazione: titolo obbligatorio

**Prompt per Claude Code:**
```
Crea src/components/task/TaskForm.tsx — form bottom sheet per agile-planner:

Struttura (vedi DESIGN_SPEC.md sezione Form):
1. Handle drag in cima (barra grigia arrotondata)
2. Header: "Nuovo impegno" + X per chiudere
3. Campo titolo: TextInput grande, placeholder "Descrivi l'impegno..."
4. Campo note: TextArea opzionale, 3 righe
5. Selezione peso: 5 pill selezionabili con colori da getWeightColor(), label "Lieve" e "Critico" agli estremi
6. Data scadenza: pulsante che apre date picker, mostra data selezionata o "Nessuna"
7. Toggle radio: "Backlog (decido dopo)" / "Calendario"
   - Se Calendario: mostra date picker data + time picker ora
8. Ricorrenza: select "Nessuna / Ogni giorno / Ogni settimana / Ogni mese"
9. CTA: pulsante blu pieno, testo adattivo al toggle

Comportamento:
- Apertura: slide-up animato da bottom
- Chiusura: swipe down o tap X
- Submit: chiama taskStore.addTask(), chiude sheet, mostra toast "Impegno aggiunto"
```

**File coinvolti:**
- `frontend/src/components/task/TaskForm.tsx` (nuovo)
- `frontend/src/components/task/TaskDetail.tsx` (stub)

---

### Task 2.2: BacklogPanel + lista

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 2.1 |

**Deliverable:**
- [ ] `BacklogPanel.tsx` con header contatore + pulsanti filtro
- [ ] Lista task backlog da store
- [ ] Stato empty (illustrazione + CTA)
- [ ] Loading skeleton

**Prompt per Claude Code:**
```
Crea src/components/backlog/BacklogPanel.tsx per agile-planner:

Header:
- "BACKLOG (N)" con contatore dinamico, label uppercase grigia 11px
- Pulsante "Peso ↓" (ordinamento corrente) + pulsante "Filtri" (icona SlidersHorizontal)

Lista:
- Mappa backlogTasks dallo store → TaskCard con variant='backlog'
- Animazione list: staggered fade-in su caricamento iniziale

Stato empty (nessun task):
- Icona Calendar (lucide) grigia, grande
- Testo "Nessun impegno in backlog" grigio
- Pulsante "Aggiungi impegno" blu

Loading:
- 3 skeleton cards animate (pulsazione grigio chiaro)

Footer:
- Pulsante "+ Aggiungi al backlog" testo blu, centrato
```

**File coinvolti:**
- `frontend/src/components/backlog/BacklogPanel.tsx` (nuovo)

---

### Task 2.3: Filtri e ordinamento backlog

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 2.2 |

**Deliverable:**
- [ ] `BacklogFilters.tsx` — bottom sheet filtri
- [ ] Ordinamento: peso ↑↓, scadenza ↑↓, creazione
- [ ] Filtri: in scadenza, nessuna data, peso 4-5, ricorrenti
- [ ] Filtri attivi → badge contatore su pulsante
- [ ] Filtri salvati in store

**Prompt per Claude Code:**
```
Crea src/components/backlog/BacklogFilters.tsx per agile-planner:

Bottom sheet con due sezioni:

"Ordina per" — radio buttons:
- Peso (dal più alto) — default
- Peso (dal più basso)
- Scadenza (prima le più vicine)
- Data aggiunta (più recenti)

"Filtra per" — checkboxes:
- In scadenza (entro 7 giorni)
- Senza data di scadenza
- Alta priorità (peso 4-5)
- Solo ricorrenti

Pulsanti: "Applica" (blu, pieno) + "Reset" (grigio, outline)

Integrazione store: aggiungi al taskStore campo filters: BacklogFilters e selector backlogTasksFiltered che applica ordinamento e filtri.

Badge: pulsante "Filtri" in BacklogPanel mostra numero di filtri attivi in badge rosso.
```

**File coinvolti:**
- `frontend/src/components/backlog/BacklogFilters.tsx` (nuovo)
- `frontend/src/store/taskStore.ts` (modifica — aggiungi filtri)

---

### Task 2.4: Swipe actions su TaskCard

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 2.2 |

**Deliverable:**
- [ ] Swipe sinistra → elimina (rosso)
- [ ] Swipe destra → completa (verde)
- [ ] Conferma elimina con alert
- [ ] Animazione spring fluida
- [ ] Touch-friendly (threshold 80px)

**Prompt per Claude Code:**
```
Implementa swipe actions su TaskCard in agile-planner usando react-swipeable o gesture manuale con pointer events:

Swipe sinistra (>80px):
- Rivela background rosso (#FF3B30) con icona Trash2 bianca
- Al rilascio: alert confirm "Eliminare l'impegno?" → taskStore.deleteTask(id)

Swipe destra (>80px):
- Rivela background verde (#34C759) con icona CheckCircle2 bianca
- Al rilascio: taskStore.completeTask(id) + micro-animazione ✓

Animazione:
- translateX smooth durante swipe
- Spring back se non supera threshold
- Fade out card se confermato

Funziona sia in BacklogPanel che in DayView.
```

**File coinvolti:**
- `frontend/src/components/task/TaskCard.tsx` (modifica)

---

### Task 2.5: TaskDetail bottom sheet

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 2.1 |

**Deliverable:**
- [ ] `TaskDetail.tsx` — bottom sheet dettaglio task
- [ ] Visualizzazione tutte le info
- [ ] Pulsanti azione: Completa / Backlog / Rinvia / Modifica
- [ ] "Rinvia" apre date picker
- [ ] "Modifica" apre TaskForm pre-compilato

**Prompt per Claude Code:**
```
Crea src/components/task/TaskDetail.tsx per agile-planner:

Bottom sheet (drag handle in cima):

Header:
- WeightBadge (grande, 36px)
- Titolo task (17px semibold)
- Pulsante ✏️ per aprire modifica

Body:
- 📅 Scadenza: [data formattata o "Nessuna"]
- 🕐 Schedulato: [data + ora o "Nel backlog"]
- 🔁 [Ricorrenza se presente]
- Note: [testo se presente]

Azioni (bottom, full width):
- [✓ Completa] verde — taskStore.completeTask
- [↩ Sposta in backlog] grigio — taskStore.moveToBacklog
- [📅 Rinvia] — apre date picker inline → taskStore.postponeTask
- [🗑 Elimina] rosso, testo piccolo — con conferma

Apertura: tap su TaskCard (non su swipe actions)
```

**File coinvolti:**
- `frontend/src/components/task/TaskDetail.tsx` (nuovo)

---

### Task 2.6: DayPage — Vista Giorno

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Task 2.2, 2.5 |

**Deliverable:**
- [ ] `DayPage.tsx` completa con navigazione ◀▶ tra giorni
- [ ] Sezione agenda: task schedulati del giorno
- [ ] Sezione backlog: BacklogPanel sotto
- [ ] Badge "peso totale giornata"
- [ ] Pulsante + per aggiungere task
- [ ] Tap su task → TaskDetail
- [ ] Swipe orizzontale pagina per cambiare giorno

**Prompt per Claude Code:**
```
Crea src/pages/DayPage.tsx — pagina principale di agile-planner:

Header (in AppShell):
- Pulsanti ◀ ▶ per navigare tra giorni
- Data centrata: "Giovedì 12 Febbraio" (oggi in blu, altri in nero)
- Pulsante + (Plus icon) che apre TaskForm

Sezione "Agenda":
- Label "OGGI" / "IERI" / data breve — uppercase grigia
- Badge inline "Peso totale: X" — somma weight dei task del giorno, colorato (verde<5, giallo<10, rosso≥10)
- Lista task getTasksForDate(selectedDate) ordinati per scheduled_at
- Se vuota: "Nessun impegno. Trascina dal backlog o aggiungi +"

Sezione "Backlog":
- <BacklogPanel /> sotto la lista agenda

Swipe orizzontale pagina:
- Swipe left → giorno successivo
- Swipe right → giorno precedente
- Animazione slide

Stato oggi evidenziato diversamente da altri giorni.
```

**File coinvolti:**
- `frontend/src/pages/DayPage.tsx` (completa)
- `frontend/src/hooks/useCalendar.ts` (nuovo — gestione data corrente)

---

## SPRINT 3 — Calendario (6 sessioni)

Vista settimana, drag & drop.

---

### Task 3.1: WeekView — griglia settimana

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Sprint 2 completo |

**Deliverable:**
- [ ] Griglia 7 giorni con header (Lu–Do + data)
- [ ] Task del giorno come pallini colorati (max 3, poi "+N")
- [ ] Giorno oggi evidenziato (cerchio blu)
- [ ] Tap su giorno → naviga a DayPage con quella data
- [ ] BacklogPanel sotto la griglia
- [ ] Navigazione settimana ◀▶

**Prompt per Claude Code:**
```
Crea src/pages/WeekPage.tsx e src/components/calendar/WeekView.tsx per agile-planner:

WeekView (componente):
- Griglia 7 colonne: Lu Ma Me Gi Ve Sa Do
- Header colonna: giorno breve + numero data
- Oggi: cerchio blu pieno dietro il numero
- Celle: pallini colorati (getWeightColor) per ogni task, max 3 mostrati poi "+N" in grigio
- Tap cella → callback onDayPress(date) → naviga a DayPage

WeekPage:
- Header: "10–16 Febbraio 2025" con ◀▶ per navigare settimana
- <WeekView /> in alto
- <BacklogPanel /> sotto, scrollabile

Navigazione: useCalendar hook con getWeekDates(weekOffset: number)
```

**File coinvolti:**
- `frontend/src/pages/WeekPage.tsx` (completa)
- `frontend/src/components/calendar/WeekView.tsx` (nuovo)
- `frontend/src/components/calendar/DayColumn.tsx` (nuovo)

---

### Task 3.2: Drag & Drop — backlog verso calendario

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Task 3.1 |

**Deliverable:**
- [ ] @dnd-kit configurato con DndContext
- [ ] BacklogItem draggable
- [ ] DayColumn droppable
- [ ] Overlay preview durante drag (TaskCard a ghost)
- [ ] Drop su giorno → apre TaskForm pre-compilato con data
- [ ] Highlight giorno target durante hover

**Prompt per Claude Code:**
```
Implementa drag & drop con @dnd-kit in agile-planner:

Setup:
- DndContext in AppShell con sensori touch + mouse
- DragOverlay con TaskCard ghost (opacity 0.8, shadow, rotate 2deg)

Backlog item draggable:
- useDraggable(id: task.id, data: { task })
- Long press attiva drag (delayactivation 150ms per non conflittare con tap)
- Cursore grab durante drag

Giorno droppable (in WeekView e DayPage):
- useDroppable(id: dateString)
- Quando DragOver → highlight bordo blu + background blu 5%
- Quando DragEnd → se over droppable valido: apri TaskForm con scheduled_date pre-compilata e task pre-caricato → utente conferma ora → taskStore.scheduleTask()

Feedback haptico (se disponibile): navigator.vibrate(50) su drop
```

**File coinvolti:**
- `frontend/src/components/layout/AppShell.tsx` (modifica — DndContext)
- `frontend/src/components/backlog/BacklogItem.tsx` (nuovo)
- `frontend/src/components/calendar/DayColumn.tsx` (modifica)

---

### Task 3.3: BacklogPage full screen

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 2.3 |

**Deliverable:**
- [ ] BacklogPage full screen con tutti i task backlog
- [ ] Filtri e ordinamento completi
- [ ] Ricerca testuale (input search)
- [ ] Sezione "In scadenza" separata (task con due_date entro 7gg)

**Prompt per Claude Code:**
```
Crea src/pages/BacklogPage.tsx — vista backlog full screen di agile-planner:

Header: "Backlog" + icona filtri + contatore totale

Search bar (iOS-style, grigia arrotondata):
- Icona Search
- Placeholder "Cerca impegni..."
- Filtra in real-time per titolo

Sezione "⚠️ In scadenza" (se ci sono task con due_date entro 7 giorni):
- Header sezione rosso
- Lista task ordinati per due_date asc
- Badge giorni rimanenti su ogni card: "Scade tra 2gg"

Sezione "Backlog":
- Lista filtrata e ordinata da BacklogFilters
- Pulsante <BacklogFilters /> sheet

FAB (Floating Action Button):
- Pulsante + blu, bottom right, apre TaskForm
- Sparisce durante scroll verso il basso, riappare verso l'alto
```

**File coinvolti:**
- `frontend/src/pages/BacklogPage.tsx` (completa)

---

### Task 3.4: Riepilogo navigazione + link tra viste

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 3.3 |

**Deliverable:**
- [ ] Tap su giorno in WeekView → DayPage con quella data
- [ ] Header DayPage aggiornato con la data corretta
- [ ] "Torna ad oggi" button se si è su data diversa
- [ ] Breadcrumb contestuale nell'header
- [ ] Coerenza stato selectedDate tra le viste

**Prompt per Claude Code:**
```
Implementa navigazione coerente tra viste in agile-planner:

useCalendar hook:
- selectedDate: Date (stato globale in Zustand o Context)
- setSelectedDate(date: Date)
- goToToday()
- goToPreviousDay() / goToNextDay()
- goToPreviousWeek() / goToNextWeek()
- isToday(date: Date): boolean
- weekDates(offset: number): Date[]

DayPage header:
- Se selectedDate != oggi: mostra pulsante "Oggi" accanto alle frecce

WeekView:
- Tap su cella giorno: setSelectedDate(date) + navigate('/')

BottomNav:
- Tab "Oggi" sempre porta a selectedDate = today + navigate('/')
```

**File coinvolti:**
- `frontend/src/hooks/useCalendar.ts` (completa)
- `frontend/src/store/` (aggiunta selectedDate o Context)

---

## SPRINT 4 — Avanzato (6 sessioni)

Task ricorrenti, notifiche push, PWA avanzata.

---

### Task 4.1: Task ricorrenti — creazione e gestione

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Sprint 3 completo |

**Deliverable:**
- [ ] Form ricorrenza: giornaliero, settimanale (selezione giorni), mensile
- [ ] Campo "fino al" (data fine ricorrenza)
- [ ] Generazione istanze future (client-side, max 90 giorni)
- [ ] Icona 🔁 + label sulla card
- [ ] Completare istanza singola vs tutte le future

**Prompt per Claude Code:**
```
Implementa task ricorrenti in agile-planner:

RecurrenceForm (componente nel TaskForm):
- Select tipo: Ogni giorno / Ogni settimana / Ogni mese / Personalizzata
- Se settimanale: toggle giorni Lu Ma Me Gi Ve Sa Do
- Se personalizzata: input "ogni N giorni/settimane/mesi"
- Date picker "Termina il" (opzionale)

Struttura dati (già in DB):
recurrence: {
  type: 'daily' | 'weekly' | 'monthly' | 'custom',
  interval: number,          // ogni N
  days?: number[],           // 0=Dom, 1=Lun... (per weekly)
  until?: string             // ISO date
}

Logica generazione istanze (src/lib/recurrence.ts):
- generateOccurrences(task: Task, from: Date, to: Date): Date[]
- Genera date in range, rispettando until
- Max 90 giorni in avanti

Completare istanza:
- Dialog: "Completa solo questo" vs "Questo e i successivi"
- "Solo questo": crea eccezione su parent_id
- "Tutti i successivi": aggiorna until = data corrente - 1gg
```

**File coinvolti:**
- `frontend/src/lib/recurrence.ts` (nuovo)
- `frontend/src/components/task/TaskForm.tsx` (modifica)
- `frontend/src/components/task/TaskDetail.tsx` (modifica)

---

### Task 4.2: Web Push — setup e subscription

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 1.2 |

**Deliverable:**
- [ ] Service Worker con push handler
- [ ] `useNotifications.ts` hook per richiedere permesso
- [ ] Salvataggio subscription in Supabase
- [ ] Banner permesso notifiche iOS-like
- [ ] Generazione VAPID keys (script)

**Prompt per Claude Code:**
```
Implementa Web Push in agile-planner:

1. scripts/generate-vapid.js:
   - Usa web-push npm package
   - Genera VAPID keys e le stampa
   - Output: VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY da inserire in .env

2. public/sw.js (service worker custom o merge con vite-plugin-pwa):
   - self.addEventListener('push', ...) → self.registration.showNotification(data.title, { body, icon, badge })
   - self.addEventListener('notificationclick', ...) → clients.openWindow('/')

3. src/hooks/useNotifications.ts:
   - requestPermission(): Promise<boolean>
   - subscribeToPush(): Promise<void> — crea PushSubscription, la salva in Supabase push_subscriptions
   - isSubscribed: boolean

4. Banner nel DayPage (prima volta):
   - "Attiva notifiche per ricevere alert sulle scadenze"
   - Pulsante "Attiva" → requestPermission() → subscribeToPush()
   - Pulsante "Non ora" → salva preferenza in localStorage
```

**File coinvolti:**
- `public/sw.js` (nuovo o modifica)
- `frontend/src/hooks/useNotifications.ts` (nuovo)
- `scripts/generate-vapid.js` (nuovo)

---

### Task 4.3: Supabase Edge Function — cron notifiche

| Campo | Valore |
|-------|--------|
| Durata | 2 sessioni |
| Dipendenze | Task 4.2 |

**Deliverable:**
- [ ] Edge Function `notify-due-tasks` in Deno
- [ ] Legge task in scadenza oggi/domani da DB
- [ ] Invia Web Push per ogni utente
- [ ] Cron schedule: ogni ora (Supabase cron)
- [ ] Log invii in tabella `notification_log`

**Prompt per Claude Code:**
```
Crea Supabase Edge Function per notifiche in agile-planner:

File: supabase/functions/notify-due-tasks/index.ts (Deno)

Logica:
1. Query: tasks WHERE due_date IN (today, tomorrow) AND status != 'done' AND status != 'postponed'
2. Per ogni task: trova push_subscription dell'utente
3. Costruisci payload: { title: task.title, body: "Scade " + formatDate(due_date), data: { taskId } }
4. Invia Web Push con web-push (compatibile Deno)
5. Gestione errori: se subscription expired → elimina da DB

Cron (in supabase/functions/notify-due-tasks/config.toml):
schedule = "0 * * * *"  → ogni ora

Variabili env necessarie:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT (mailto:simone@example.com)

Tabella log (opzionale): notification_log (task_id, sent_at, status)
```

**File coinvolti:**
- `supabase/functions/notify-due-tasks/index.ts` (nuovo)
- `supabase/functions/notify-due-tasks/config.toml` (nuovo)
- `scripts/migration.sql` (aggiunta tabella log)

---

### Task 4.4: PWA — installabilità e offline

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Sprint 3 completo |

**Deliverable:**
- [ ] Manifest completo (icone, splash screen, colori)
- [ ] Cache strategia: app shell offline-first
- [ ] Indicatore offline nell'UI
- [ ] Prompt installazione PWA (deferredPrompt)
- [ ] Icone 192x192 e 512x512

**Prompt per Claude Code:**
```
Completa PWA per agile-planner:

1. vite.config.ts — vite-plugin-pwa config completa:
   - manifest: name, short_name, description, theme_color (#007AFF), background_color (#F2F2F7), display: standalone, orientation: portrait
   - icons: 192x192 e 512x512 (placeholder SVG con icona calendario)
   - workbox: strategie cache — networkFirst per API Supabase, cacheFirst per assets statici

2. Indicatore offline:
   - Hook useOnlineStatus() — window online/offline events
   - Banner "Sei offline. Alcune funzioni non disponibili." quando offline

3. Prompt installazione:
   - Intercetta beforeinstallprompt
   - Dopo 3 giorni d'uso: banner "Installa Agile Planner per un'esperienza migliore" con pulsante "Installa"

4. Splash screen iOS: meta tag apple-mobile-web-app-* in index.html
```

**File coinvolti:**
- `frontend/vite.config.ts` (modifica)
- `frontend/index.html` (modifica)
- `frontend/src/hooks/useOnlineStatus.ts` (nuovo)

---

## SPRINT 5 — Rifinitura (4 sessioni)

UX polish, animazioni, stabilità.

---

### Task 5.1: Animazioni e micro-interazioni

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Sprint 4 completo |

**Prompt per Claude Code:**
```
Aggiungi animazioni e micro-interazioni in agile-planner usando CSS transitions e Framer Motion (leggero):

1. TaskCard:
   - Tap: scale(0.97) 120ms ease-out
   - Completato: fade + strikethrough animato 200ms
   - Aggiunta al calendario: slide-in dall'alto

2. Bottom sheet:
   - Open: slide-up 300ms spring (stiffness 400, damping 30)
   - Close: slide-down 200ms ease-in

3. Backlog list:
   - Staggered entrance: ogni card con delay 50ms * index
   - Remove: slide-left + fade-out 200ms

4. Navigazione giorni:
   - Swipe: slide orizzontale 250ms ease-in-out

5. WeightBadge:
   - Hover/tap: leggero scale-up 1.1

6. Badge peso totale giornata:
   - Cambia colore con transizione smooth 300ms
```

---

### Task 5.2: Gestione errori e feedback utente

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 5.1 |

**Prompt per Claude Code:**
```
Implementa gestione errori robusta in agile-planner:

1. Toast system (shadcn/ui Sonner):
   - Successo: "Impegno aggiunto ✓", "Completato ✓", "Spostato nel backlog"
   - Errore: "Errore di connessione. Riprova." con pulsante Riprova
   - Warning: "Scadenza passata — sicuro di voler salvare?"

2. Offline queue:
   - Se offline durante addTask/updateTask: salva in localStorage queue
   - Quando torna online: processa queue automaticamente
   - Toast "3 modifiche sincronizzate ✓"

3. Validazione form:
   - Titolo vuoto: shake animation + bordo rosso + messaggio sotto
   - Data scadenza passata: warning (non blocca)
   - Ora schedulata nel passato (oggi): warning

4. Empty states:
   - DayPage senza task: illustrazione SVG + CTA contestuale
   - BacklogPage vuoto: "Tutto in ordine! Nessun impegno in sospeso 🎉"

5. Loading states:
   - Skeleton per caricamento iniziale
   - Spinner inline per azioni (non blocca UI)
```

---

### Task 5.3: Settings e preferenze utente

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Task 5.2 |

**Prompt per Claude Code:**
```
Crea pagina Settings in agile-planner (accessibile da header o bottom nav come quarta voce):

Sezioni:

"Account"
- Email utente (non modificabile)
- Pulsante "Esci" (signOut)

"Notifiche"
- Toggle "Notifiche attive" (gestisce permesso push)
- "Alert oggi e domani" toggle
- "Orario promemoria giornaliero" (time picker, opzionale)

"Preferenze"
- "Vista predefinita" — Oggi / Settimana / Backlog
- "Primo giorno settimana" — Lunedì / Domenica

"Dati"
- "Esporta task (JSON)" — scarica JSON con tutti i task
- "Esporta task (CSV)"

Stile iOS Settings: lista con separatori, label grigie sezioni uppercase, freccia destra per navigabili.
```

---

### Task 5.4: Deploy + documentazione finale

| Campo | Valore |
|-------|--------|
| Durata | 1 sessione |
| Dipendenze | Sprint 5 completo |

**Prompt per Claude Code:**
```
Prepara agile-planner per il deploy su Vercel:

1. vercel.json:
   - rewrites per SPA (/* → /index.html)
   - headers HTTPS e security

2. frontend/.env.production:
   - Template con tutte le variabili necessarie

3. GUIDA_SVILUPPO_UTENTE.md aggiornato con:
   - Istruzioni deploy Vercel (step by step)
   - Setup Supabase (migration SQL, Edge Function deploy)
   - Generazione VAPID keys
   - Configurazione variabili d'ambiente

4. GitHub Actions (opzionale):
   - .github/workflows/deploy.yml
   - Deploy automatico su push a main

5. Verifica checklist PWA:
   - Lighthouse PWA score > 90
   - HTTPS attivo
   - Manifest valido
   - Service Worker attivo
```

---

## Riepilogo Tempi

| Sprint | Sessioni | Focus |
|--------|----------|-------|
| Sprint 1 | 6 | Foundation, auth, shell |
| Sprint 2 | 8 | Task CRUD, backlog, day view |
| Sprint 3 | 6 | Calendar, week view, drag & drop |
| Sprint 4 | 6 | Ricorrenze, notifiche push, PWA |
| Sprint 5 | 4 | Polish, errori, deploy |
| **Totale** | **30** | **~75-90 ore** |

## Note per Claude Code

- Leggere sempre `CLAUDE.md` prima di ogni sessione
- Aggiornare `PROGRESS.md` dopo ogni task completato
- Usare branch separati per ogni task
- Commit atomici con messaggio: `feat(1.1): setup vite + react + typescript`
- Non toccare mai file di Sprint futuri senza completare i precedenti
