import { useState, useMemo } from 'react'
import { SlidersHorizontal, Calendar, Plus } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import {
  BacklogFilters,
  countActiveFilters,
  type BacklogFiltersState,
  type SortOption,
} from './BacklogFilters'

interface BacklogPanelProps {
  onAddTask: () => void
}

/**
 * BacklogPanel - Lista completa del backlog
 * - Header con contatore e filtri
 * - Lista task ordinata per peso
 * - Empty state con CTA
 * - Loading skeleton
 */
export function BacklogPanel({ onAddTask }: BacklogPanelProps) {
  const tasks = useTaskStore(state => state.tasks)
  const loading = useTaskStore(state => state.loading)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<BacklogFiltersState>({
    sortBy: 'weight-desc',
    dueSoon: false,
    noDueDate: false,
    highPriority: false,
    recurringOnly: false,
  })

  // Apply filters and sorting
  const backlogTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.status === 'backlog')

    // Apply filters
    if (filters.dueSoon) {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      filtered = filtered.filter(
        t => t.due_date && new Date(t.due_date) <= sevenDaysFromNow
      )
    }

    if (filters.noDueDate) {
      filtered = filtered.filter(t => !t.due_date)
    }

    if (filters.highPriority) {
      filtered = filtered.filter(t => t.weight >= 4)
    }

    if (filters.recurringOnly) {
      filtered = filtered.filter(t => t.is_recurring)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'weight-desc':
          return b.weight - a.weight
        case 'weight-asc':
          return a.weight - b.weight
        case 'due-date-asc':
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'created-at-desc':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        default:
          return 0
      }
    })

    return sorted
  }, [tasks, filters])

  const activeFiltersCount = countActiveFilters(filters)

  const getSortLabel = (sortBy: SortOption) => {
    switch (sortBy) {
      case 'weight-desc':
        return 'Peso ↓'
      case 'weight-asc':
        return 'Peso ↑'
      case 'due-date-asc':
        return 'Scadenza ↑'
      case 'created-at-desc':
        return 'Data ↓'
      default:
        return 'Peso ↓'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div
            className="h-4 w-24 rounded animate-pulse"
            style={{ backgroundColor: 'var(--color-separator)' }}
          />
          <div className="flex gap-2">
            <div
              className="h-8 w-20 rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--color-separator)' }}
            />
            <div
              className="h-8 w-20 rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--color-separator)' }}
            />
          </div>
        </div>

        {/* Loading skeleton - 3 cards */}
        <div className="flex-1 px-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{
                backgroundColor: 'var(--color-background-card)',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--color-separator)' }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          BACKLOG ({backlogTasks.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-background-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            {getSortLabel(filters.sortBy)}
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors relative"
            style={{
              backgroundColor: 'var(--color-background-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            <SlidersHorizontal size={16} />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: 'var(--color-destructive)',
                  color: 'white',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Task list or empty state */}
      {backlogTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--color-background-section)' }}
          >
            <Calendar
              size={32}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </div>
          <p
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Nessun impegno in backlog
          </p>
          <p
            className="text-sm text-center mb-6"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Aggiungi un impegno per iniziare a pianificare
          </p>
          <button
            onClick={onAddTask}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Aggiungi impegno
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Task list with staggered animation */}
          <div className="px-4 py-4 space-y-3">
            {backlogTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <SwipeableTaskCard task={task} />
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="px-4 pb-4">
            <button
              onClick={onAddTask}
              className="w-full py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2"
              style={{
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-background-section)',
              }}
            >
              <Plus size={18} />
              Aggiungi al backlog
            </button>
          </div>
        </div>
      )}

      {/* Filters modal */}
      {showFilters && (
        <BacklogFilters
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}
