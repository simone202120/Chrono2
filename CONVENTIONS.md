# CONVENTIONS — Agile Planner

## Struttura File

### Componenti React

```typescript
// 1. Imports (external → internal → types → styles)
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

// 2. Interfaccia props
interface TaskCardProps {
  task: Task
  variant: 'calendar' | 'backlog'
  onTap?: (task: Task) => void
}

// 3. Componente
export function TaskCard({ task, variant, onTap }: TaskCardProps) {
  // hooks prima di tutto
  // logica derivata con useMemo
  // handlers
  // render
}
```

### Store Zustand

```typescript
interface TaskState {
  // stato
  tasks: Task[]
  isLoading: boolean
  // azioni
  fetchTasks: () => Promise<void>
  addTask: (input: CreateTaskInput) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.from('tasks').select('*')
      if (error) throw error
      set({ tasks: data ?? [] })
    } finally {
      set({ isLoading: false })
    }
  },
}))
```

## Naming Convention

| Cosa | Convenzione | Esempio |
|------|-------------|---------|
| Componenti | PascalCase | `TaskCard.tsx` |
| Hook | camelCase con `use` | `useCalendar.ts` |
| Store | camelCase con `Store` | `taskStore.ts` |
| Utility | camelCase | `utils.ts` |
| Tipi | PascalCase | `Task`, `TaskStatus` |
| Costanti | UPPER_SNAKE | `MAX_WEIGHT = 5` |
| Variabili | camelCase | `dueDate`, `weightColor` |

## Import Alias

Usare `@/` per imports da `src/`:

```typescript
// ✓ corretto
import { Task } from '@/types/task'
import { useTaskStore } from '@/store/taskStore'

// ✗ da evitare
import { Task } from '../../types/task'
```

## Tailwind — Ordine Classi

```
1. Layout:     flex, grid, block, hidden
2. Position:   relative, absolute, fixed
3. Sizing:     w-*, h-*, min-*, max-*
4. Spacing:    p-*, m-*, gap-*, space-*
5. Typography: text-*, font-*, leading-*
6. Colors:     text-*, bg-*, border-*
7. Effects:    rounded-*, shadow-*, opacity-*
8. Transitions: transition-*, duration-*, ease-*
9. Responsive: sm:, md:, lg:
10. Dark mode: dark:
```

Esempio:
```tsx
<div className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white rounded-xl shadow-sm transition-all duration-150 hover:bg-gray-50">
```

## Date

Usare sempre `date-fns` per manipolazioni:

```typescript
import { format, isToday, isTomorrow, addDays, startOfWeek } from 'date-fns'
import { it } from 'date-fns/locale'

// Formattazione con locale italiano
format(date, 'dd MMMM yyyy', { locale: it })  // "12 febbraio 2025"
format(date, 'HH:mm')  // "09:00"
```

Non usare mai `new Date()` inline nei componenti — passare la data come prop o ottenerla dallo store.

## Gestione Asincrona

```typescript
// Pattern standard con ottimistic update
const addTask = async (input: CreateTaskInput) => {
  const tempId = crypto.randomUUID()
  const optimisticTask = { ...input, id: tempId, status: 'backlog' as const }

  // 1. Update ottimistico
  set(state => ({ tasks: [...state.tasks, optimisticTask] }))

  try {
    // 2. Chiamata reale
    const { data, error } = await supabase.from('tasks').insert(input).select().single()
    if (error) throw error

    // 3. Sostituisci temp con reale
    set(state => ({
      tasks: state.tasks.map(t => t.id === tempId ? data : t)
    }))
  } catch {
    // 4. Rollback
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== tempId)
    }))
    toast.error('Errore durante il salvataggio')
  }
}
```

## Accesso Sicuro a Date

```typescript
// ✓ Usa date-fns
const isExpired = dueDate ? isPast(new Date(dueDate)) : false

// ✗ Non usare
const isExpired = new Date(dueDate) < new Date()
```
