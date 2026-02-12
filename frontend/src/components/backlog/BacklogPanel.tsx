import { useState } from 'react'
import { SlidersHorizontal, Calendar, Plus } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskCard } from '@/components/task/TaskCard'

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
  const [sortBy] = useState<'weight' | 'date'>('weight')

  // Filter backlog tasks and sort by weight (descending)
  const backlogTasks = tasks
    .filter(t => t.status === 'backlog')
    .sort((a, b) => {
      if (sortBy === 'weight') {
        return b.weight - a.weight
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

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
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-background-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            Peso ↓
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-background-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            <SlidersHorizontal size={16} />
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
                <TaskCard task={task} />
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
    </div>
  )
}
