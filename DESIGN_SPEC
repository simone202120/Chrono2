# DESIGN SPEC — Agile Planner

## Principio Guida

**"A colpo d'occhio"** — ogni card deve comunicare tutto in 2 secondi: cosa è, quanto è urgente, quando scade. Nessuna informazione nascosta su interazioni secondarie per i dati essenziali.

## Palette Colori

```
Background principale:  #F2F2F7  (iOS system gray 6)
Background card:        #FFFFFF
Background sezione:     #EFEFF4

Testo primario:         #1C1C1E  (quasi nero)
Testo secondario:       #8E8E93  (grigio medio)
Testo placeholder:      #C7C7CC

Accent primario:        #007AFF  (iOS blue)
Accent distruttivo:     #FF3B30  (iOS red)
Accent successo:        #34C759  (iOS green)
Accent warning:         #FF9500  (iOS orange)

Separatore:             #C6C6C8  (opacità 0.3)
```

### Colori Peso Task

| Peso | Hex | Label |
|------|-----|-------|
| 1 | `#34C759` | Leggero |
| 2 | `#007AFF` | Normale |
| 3 | `#FF9F0A` | Medio |
| 4 | `#FF6B00` | Impegnativo |
| 5 | `#FF3B30` | Critico |

## Tipografia

```
Font:       System UI → SF Pro (iOS), Roboto (Android), Inter (web)

Titolo app: 17px, semibold, #1C1C1E
Titolo card: 15px, medium, #1C1C1E
Sottotitolo: 13px, regular, #8E8E93
Badge/label: 11px, medium, uppercase tracking

Line height: 1.4 standard, 1.2 per titoli brevi
```

## Spaziatura & Layout

```
Padding pagina:     16px laterale
Gap tra card:       8px
Border radius card: 12px
Border radius badge: 6px
Border radius pill:  20px (fully rounded)

Bottom nav height:  83px (include safe area iOS)
Header height:      52px
```

## Componenti

### TaskCard

```
┌──────────────────────────────────────────┐
│ ● [peso]  Titolo del task          [⚠️]  │
│           📅 15 feb  •  14:00      [🔁]  │
└──────────────────────────────────────────┘

● = pallino colorato (colore = peso)
[peso] = numero 1-5 in grigio chiaro accanto al pallino
[⚠️] = visibile solo se scadenza entro 48h (colore rosso)
[🔁] = visibile solo se task ricorrente
📅 = data scadenza
14:00 = ora schedulata (solo se in calendario)

Stato completato → card grigiata, titolo barrato, opacità 0.5
```

### WeightBadge

```
┌────┐
│ ●3 │  ← pallino colorato + numero, pill shape
└────┘
Dimensione: 28x20px, font 11px medium
```

### Schermata Principale — Vista Giorno

```
┌─────────────────────────────────────────┐  ← status bar iOS
│                                         │
│  ◀  Giovedì 12 Febbraio  ▶         [+] │  ← header
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  OGGI              Peso totale: ████░ 9 │  ← sezione agenda
│  ──────────────────────────────────     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ●5  Consegna report EIT    ⚠️   │    │
│  │     09:00  •  📅 Scade oggi     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ●3  Call con ATHENA RC          │    │
│  │     11:00  •  📅 20 feb         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ✓   Review deliverable          │    │  ← completato
│  │     14:00  •  completato        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  + Aggiungi impegno oggi                │  ← tap per aggiungere
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  BACKLOG (4)          [Peso ↓] [Filtri] │  ← sezione backlog
│  ──────────────────────────────────     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ●5  Aggiornare PROGRESS.md  ⚠️  │    │
│  │     📅 Scade: 14 feb            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ●2  Leggere articolo AI         │    │
│  │     Nessuna scadenza            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ Aggiungi al backlog]                │
│                                         │
├─────────────────────────────────────────┤
│  [📅 Oggi]  [📆 Settimana]  [📋 Backlog]│  ← bottom nav
└─────────────────────────────────────────┘
```

### Vista Settimana

```
┌─────────────────────────────────────────┐
│  ◀  10–16 Febbraio 2025  ▶              │
├──────┬──────┬──────┬──────┬──────┬──────┤
│  Lu  │  Ma  │  Me  │  Gi* │  Ve  │  Sa  │  ← * = oggi, cerchio blu
│  10  │  11  │  12  │  13  │  14  │  15  │
│      │      │      │  ●●  │  ●5  │      │  ← pallini task (max 3 poi "+N")
├──────┴──────┴──────┴──────┴──────┴──────┤
│                                         │
│  BACKLOG (4)          [Peso ↓] [Filtri] │
│  ──────────────────────────────────     │
│  [lista backlog draggabile sui giorni]  │
│                                         │
└─────────────────────────────────────────┘
```

**Drag & Drop:** tenere premuto su backlog item → appare shadow elevation → trascinare sul giorno → giorno si evidenzia in blu → rilascio → sheet scheduling con data pre-compilata.

### Form Aggiunta Task

```
┌─────────────────────────────────────────┐
│  ✕  Nuovo impegno                       │  ← modale bottom sheet
│  ──────────────────────────────────     │
│                                         │
│  Titolo *                               │
│  ┌─────────────────────────────────┐    │
│  │ Descrivi l'impegno...           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Note (opzionale)                       │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Peso / Impegno                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 1  │ │ 2  │ │●3●│ │ 4  │ │ 5  │   │  ← pill selezionabili
│  └────┘ └────┘ └────┘ └────┘ └────┘   │
│    🟢    🔵    🟡    🟠    🔴          │
│  Lieve              Critico            │
│                                         │
│  Data scadenza            [📅 Nessuna] │
│                                         │
│  ──── Dove lo aggiungi? ────            │
│  ○  Backlog (decido dopo)              │
│  ●  Calendario                          │
│     Data  [📅 Oggi]  Ora  [🕐 09:00]  │
│                                         │
│  Ricorrenza                [Nessuna ▼] │
│  ▸ Ogni giorno / settimana / mese      │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [        Salva nel Backlog        ]    │  ← CTA adattivo al toggle
└─────────────────────────────────────────┘
```

### Filtri Backlog

```
┌─────────────────────────────────────────┐
│  Ordina per              Filtra per     │
│  ○ Peso (↓)             □ In scadenza   │
│  ○ Peso (↑)             □ Nessuna data  │
│  ○ Scadenza (↑)         □ Peso 4-5      │
│  ○ Data creazione        □ Ricorrenti   │
│                                         │
│  [Applica]              [Reset]         │
└─────────────────────────────────────────┘
```

### Azioni Swipe su TaskCard

```
← Swipe sinistra:   [🗑 Elimina]  (rosso)
→ Swipe destra:     [✓ Completa] (verde)
Tap:                Apre TaskDetail (bottom sheet)
Long press:         Attiva drag & drop
```

### TaskDetail (bottom sheet)

```
┌─────────────────────────────────────────┐
│  ━━━ (handle)                           │
│                                         │
│  ●5  Consegna report EIT          [✏️]  │
│                                         │
│  📅 Scadenza: 14 feb 2025               │
│  🕐 Schedulato: 12 feb, 09:00          │
│  🔁 Non ricorrente                      │
│                                         │
│  Note: ─────────────────────────────   │
│  Deliverable per il progetto C-MineTech │
│                                         │
│  ──────────────────────────────────     │
│  [✓ Completato]  [↩ Backlog]  [📅 Rinvia]│
└─────────────────────────────────────────┘
```

## Animazioni & Transizioni

```
Card tap:             scale(0.97) → 120ms ease-out
Bottom sheet open:    slide-up → 300ms spring
Drag overlay:         shadow + scale(1.03) + rotation(2deg)
Task completato:      fade + strikethrough → 200ms
Swipe actions:        reveal → 150ms ease-out
Page transition:      slide horizontal → 250ms ease-in-out
```

## Responsive & PWA

- **Base:** 375px (iPhone SE) → tutto deve funzionare qui
- **Ottimale:** 390px (iPhone 14)
- **Tablet:** layout a due colonne (backlog | calendario) se >768px
- **Safe areas:** padding-bottom per notch e home indicator iOS
- **Dark mode:** supportato via Tailwind `dark:` classes (future)

## Icone

Usare `lucide-react` per coerenza:
- `Plus` — aggiungi task
- `ChevronLeft/Right` — navigazione data
- `CheckCircle2` — completato
- `AlertCircle` — scadenza vicina
- `RefreshCw` — ricorrente
- `Calendar` — data
- `Clock` — ora
- `Grip` — handle drag
- `SlidersHorizontal` — filtri
