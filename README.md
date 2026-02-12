# 📋 Agile Planner

> App mobile personale per la gestione degli impegni in stile agile — backlog, calendario, peso, scadenze.

## Overview

Agile Planner è una PWA mobile-first che unisce un **backlog agile** a un **calendario personale**. Ogni impegno ha un peso (1–5), una data di scadenza e può essere schedulato su uno specifico giorno oppure lasciato nel backlog finché non si decide quando farlo.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Drag & Drop | @dnd-kit |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Push Notify | Web Push API |
| Deploy | Vercel |
| PWA | vite-plugin-pwa |

## Quick Start

```bash
cd frontend
cp .env.example .env.local
# → inserisci le variabili Supabase
npm install
npm run dev
```

## Struttura

```
agile-planner/
├── README.md
├── PROJECT_BRIEF.md
├── ARCHITECTURE.md
├── DESIGN_SPEC.md
├── PROGRESS.md
├── CLAUDE.md
├── GUIDA_SVILUPPO_UTENTE.md
├── .gitignore
├── docs/
│   ├── PIANO_IMPLEMENTAZIONE.md
│   ├── CONVENTIONS.md
│   └── decisions/
├── frontend/
│   ├── README.md
│   ├── .env.example
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── hooks/
│       ├── lib/
│       └── types/
└── scripts/
```

## Documentazione

- [Project Brief](PROJECT_BRIEF.md) — problema, soluzione, funzionalità
- [Architettura](ARCHITECTURE.md) — stack, DB schema, flussi
- [Design Spec](DESIGN_SPEC.md) — wireframe, stili, UX
- [Piano Implementazione](docs/PIANO_IMPLEMENTAZIONE.md) — sprint e task dettagliati
- [Progress](PROGRESS.md) — stato avanzamento
- [Claude.md](CLAUDE.md) — istruzioni per Claude Code
