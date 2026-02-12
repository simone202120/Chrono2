# PROJECT BRIEF — Agile Planner

## Il Problema

I tool di gestione impegni esistenti (Google Calendar, Todoist, Reminders) trattano tutti i task come elementi da inserire in una data precisa. Questo approccio non rispecchia la realtà: spesso si sa che qualcosa va fatto, ma non ancora quando. Il risultato è un backlog mentale non catturato, scadenze mancate e nessuna visione del "peso" di una giornata.

## La Soluzione

Una PWA mobile personale che unisce la logica agile (backlog → sprint/calendario) alla semplicità di un'agenda quotidiana. Il task vive nel backlog finché non si decide di schedularlo; ha sempre una scadenza (per gli alert) e un peso (per capire quanto è impegnativo).

## Utente

**Simone** — unico utente. Coordinatore di progetti europei, abituato al pensiero agile. Usa il telefono per gestire gli impegni durante la giornata.

## Funzionalità Core

### Task
- Titolo, descrizione opzionale
- **Peso** 1–5 (1=leggero, 5=critico) — visualizzato con colore sulla card
- **Data scadenza** — indipendente dalla data di esecuzione, usata per gli alert
- **Data schedulata** — quando effettivamente si fa (null = backlog)
- **Stato**: `backlog` | `scheduled` | `done` | `postponed`
- **Ricorrenza**: giornaliera, settimanale, mensile, personalizzata

### Backlog
- Lista di tutti i task non schedulati
- Filtri: per peso, per scadenza, per stato, per tag
- Ordinamento: peso ↑↓, scadenza ↑↓, creazione ↑↓
- Drag & drop verso il calendario
- Azione rapida: schedula, completa, rinvia, elimina

### Calendario
- Vista giorno: lista oraria degli impegni del giorno
- Vista settimana: griglia 7 giorni con card task
- Backlog sempre visibile sotto o a lato
- Drag & drop dal backlog su un giorno/ora
- Badge "peso totale giornata" su ogni giorno

### Notifiche
- **Alert scadenza oggi/domani**: notifica push quando un task sta per scadere
- **Push notification**: tramite Web Push API, funziona anche con app chiusa

### Gestione Task
- Completare con un tap (swipe o checkbox)
- Rinviare: sposta la data schedulata
- Rimandare al backlog: rimuove la data schedulata
- Modifica completa in qualsiasi momento

## Funzionalità Nice-to-Have (post-MVP)
- Statistiche: task completati per settimana, peso medio giornata
- Tag/etichette colorate
- Note vocali su task
- Widget iOS/Android (con PWA)
- Export dati (CSV/JSON)

## Vincoli

| Vincolo | Valore |
|---------|--------|
| Piattaforma | PWA Mobile (iOS Safari + Chrome Android) |
| Utenti | 1 (solo Simone) |
| Backend | Supabase (piano free sufficiente) |
| Deploy | Vercel (piano free) |
| Budget | Zero (solo servizi free tier) |
| Timeline | ~30 sessioni di sviluppo |

## Definizione di Successo

L'app è un successo se Simone la usa ogni giorno al posto delle app attuali, e se il backlog è sempre svuotato verso il calendario in modo fluido.
