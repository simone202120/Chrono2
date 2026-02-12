# CLAUDE.md — Istruzioni per Claude Code

> Leggi questo file PRIMA di iniziare qualsiasi sessione di sviluppo.

## Cos'è questo progetto

**Agile Planner** — PWA mobile personale per la gestione degli impegni in stile agile.
Un solo utente (Simone). Stack: React 18 + Vite + TypeScript + Tailwind + Supabase.

## Regola #1: Controlla PROGRESS.md prima di tutto

Prima di scrivere una riga di codice, leggi `PROGRESS.md` per sapere:
- Quali task sono completati
- Qual è il task corrente
- Cosa NON toccare

## Regola #2: Un task alla volta

Lavora SOLO sul task specificato nel prompt. Non anticipare task futuri.
Se noti qualcosa da migliorare in un'area diversa, annotalo ma non intervenire.

## Regola #3: Qualità del Codice e Architettura

**MASSIMA ATTENZIONE ALLA QUALITÀ** — Il codice deve essere:
- ✅ **Sintatticamente corretto**: zero errori TypeScript, zero warning ESLint
- ✅ **Logicamente corretto**: funziona come previsto, gestisce edge cases
- ✅ **Professionale**: leggibile, manutenibile, ben strutturato
- ✅ **Type-safe**: tipi espliciti, no `any`, no casting non sicuri

### Rispetto dell'architettura

L'architettura è **RIGIDA** e deve essere rispettata:
- Store Zustand è l'unica fonte di verità (SSOT)
- Tutte le query Supabase passano da `taskStore.ts`
- Componenti sono puri e non hanno logica di business
- Hook custom per logica riutilizzabile, non nei componenti
- Nessuna dipendenza circolare tra moduli

### Gestione file

**NON creare nuovi file senza necessità assoluta.** Prima di creare un file:
1. Verifica se esiste già un file adatto per quella logica
2. Se serve davvero, **CHIEDI AUTORIZZAZIONE ALL'UTENTE** prima di crearlo
3. Posiziona il file nella **cartella corretta** secondo la struttura (vedi sotto)
4. NON creare file in giro o in posizioni casuali

### Comprensione delle librerie

Prima di usare una libreria:
- Usa **Context7** o documentazione ufficiale per capire bene l'API
- Non improvvisare: leggi esempi e best practices
- Verifica compatibilità con React 18, TypeScript strict, mobile
- Preferisci API moderne e raccomandate dalla libreria

## Struttura progetto

```
frontend/src/
├── types/task.ts          ← tipi TypeScript globali, non modificare senza motivo
├── lib/supabase.ts        ← client Supabase, non duplicare
├── lib/utils.ts           ← helper puri, nessuna dipendenza da React
├── store/taskStore.ts     ← SSOT per i task, tutte le operazioni DB passano da qui
├── store/authStore.ts     ← stato autenticazione
├── hooks/                 ← hook React custom, non logica di business
├── components/            ← componenti puri, no chiamate dirette Supabase
└── pages/                 ← pagine, usano store e componenti
```

## Convenzioni codice

### TypeScript
- `strict: true` sempre
- Nessun `any` — usare tipi propri o `unknown`
- Interfacce con prefisso `I` solo se ambigue, altrimenti nomi diretti
- Enums: usare `const enum` o string union types

### React
- Componenti funzionali sempre
- Hook custom per logica riutilizzabile
- Props tipizzate con interfaccia separata sopra il componente
- Nessun `useEffect` per logica derivata — usare `useMemo`

### Naming
- Componenti: `PascalCase`
- Hook: `useCamelCase`
- Store: `camelCaseStore`
- File componente: stesso nome del componente
- Costanti: `UPPER_SNAKE_CASE`

### Stile (Tailwind)
- Usare variabili CSS per colori custom (definite in `tailwind.config.ts`)
- Non usare stili inline se evitabile
- Classi ordinate: layout → spacing → typography → colors → effects
- Classi condizionali con `cn()` da `lib/utils.ts`

### Supabase
- TUTTE le query passano da `taskStore.ts` — mai query dirette nei componenti
- Ottimistic updates sempre: aggiorna stato locale prima, rollback se errore
- RLS è attiva — non serve filtrare per user_id client-side, ma farlo comunque per sicurezza

## Design System

Riferimento: `DESIGN_SPEC.md`

Colori principali (già in tailwind.config):
- `primary`: #007AFF (iOS blue)
- `destructive`: #FF3B30
- `success`: #34C759
- `warning`: #FF9500
- `weight-1` → `weight-5`: verde → rosso

Font: `font-sans` = system-ui (SF Pro su iOS, Roboto su Android, Inter su desktop)

Border radius standard: `rounded-xl` (12px) per card, `rounded-full` per badge

## Gestione errori

Pattern standard per operazioni async:

```typescript
try {
  // ottimistic update
  set(state => ({ tasks: [...state.tasks, newTask] }))
  // chiamata Supabase
  const { error } = await supabase.from('tasks').insert(newTask)
  if (error) throw error
} catch (error) {
  // rollback
  set(state => ({ tasks: state.tasks.filter(t => t.id !== newTask.id) }))
  // feedback utente
  toast.error('Errore durante il salvataggio. Riprova.')
}
```

## Git Workflow & Branching Strategy

### Strategia di Branch

**Un branch per Sprint**, NON un branch per task:

- **Sprint 1**: `feature/sprint-1` → 6 task → 6 commit → 1 PR
- **Sprint 2**: `feature/sprint-2` → 6 task → 6 commit → 1 PR
- **Sprint 3**: `feature/sprint-3` → 4 task → 4 commit → 1 PR
- **Sprint 4**: `feature/sprint-4` → 4 task → 4 commit → 1 PR
- **Sprint 5**: `feature/sprint-5` → 4 task → 4 commit → 1 PR

### Workflow per ogni Sprint

1. **Inizio Sprint**: crea branch `feature/sprint-N` da `main`
2. **Durante Sprint**: per ogni task completato → commit + push
3. **Fine Sprint**: verifica completa → crea PR → merge in `main`

### Commit Convention

```
feat(N.M): descrizione breve task
fix(componente): cosa è stato corretto
refactor(store): cosa è cambiato e perché
```

Esempi:
- `feat(1.1): setup vite + react + typescript + pwa`
- `feat(1.6): add TaskCard with weight badge and swipe actions`
- `fix(taskStore): handle null scheduled_at in filters`

### Push dopo ogni task

**IMPORTANTE**: dopo ogni task completato, fai SEMPRE:
```bash
git add .
git commit -m "feat(N.M): descrizione"
git push origin feature/sprint-N
```

Questo permette di:
- Tracciare il progresso task per task
- Avere checkpoint frequenti
- Facilitare eventuali rollback
- Vedere l'evoluzione dello sprint commit per commit

## Aggiornare PROGRESS.md

Dopo ogni task completato, aggiorna PROGRESS.md:
1. Segna il task come `[x]` completato
2. Aggiungi data completamento
3. Aggiorna la sezione "Stato attuale"
4. Nota eventuali deviazioni o decisioni prese

## Variabili d'ambiente necessarie

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_VAPID_PUBLIC_KEY=
```

Per le Edge Functions Supabase:
```env
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

## Librerie approvate

Già nel piano:
- `@dnd-kit/core`, `@dnd-kit/sortable` — drag & drop
- `zustand` — state management
- `date-fns` — manipolazione date
- `lucide-react` — icone
- `@supabase/supabase-js` — client Supabase
- `vite-plugin-pwa` — PWA
- `shadcn/ui` components — UI base

Aggiungere altre librerie SOLO se strettamente necessario e dopo averle valutate per:
- Bundle size (preferire < 10kb gzipped)
- Manutenzione attiva
- Compatibilità mobile

## Non fare mai

- ❌ Query Supabase dirette nei componenti
- ❌ Stato locale per dati che devono persistere (usare store)
- ❌ `console.log` nel codice committato
- ❌ Hardcode di stringhe UI (usare costanti o i18n-ready)
- ❌ Modificare `scripts/migration.sql` senza commentare le modifiche
- ❌ Toccare task di Sprint futuri
