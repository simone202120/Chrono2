# Agile Planner — Frontend

> Mobile-first PWA built with React 18 + Vite + TypeScript

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (iOS-inspired palette)
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Dates**: date-fns
- **PWA**: vite-plugin-pwa

## Project Structure

```
src/
├── components/     # React components (pure, no business logic)
├── pages/          # Page-level components
├── store/          # Zustand stores (single source of truth)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers (no React dependencies)
├── types/          # TypeScript type definitions
└── main.tsx        # App entry point
```

## Scripts

- `npm run dev` — Start dev server (http://localhost:5173)
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier
