import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, AlertCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { AppShell } from '@/components/layout/AppShell'
import { BacklogItem } from '@/components/backlog/BacklogItem'
import { TaskForm } from '@/components/task/TaskForm'
import { TaskDetail } from '@/components/task/TaskDetail'
import {
  BacklogFilters,
  countActiveFilters,
  type BacklogFiltersState,
  type SortOption,
} from '@/components/backlog/BacklogFilters'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

/**
 * BacklogPage - Full screen backlog view
 * - Search bar for filtering by title
 * - "In scadenza" section for tasks due within 7 days
 * - Full backlog list with filters
 * - FAB with scroll detection (hide on scroll down, show on scroll up)
 */
export function BacklogPage() {
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFAB, setShowFAB] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  const [filters, setFilters] = useState<BacklogFiltersState>({
    sortBy: 'weight-desc',
    dueSoon: false,
    noDueDate: false,
    highPriority: false,
    recurringOnly: false,
  })

  // FAB scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollY = container.scrollTop
      const scrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 50

      setShowFAB(!scrollingDown)
      lastScrollY.current = currentScrollY
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Get backlog tasks
  const backlogTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'backlog')
  }, [tasks])

  // Tasks due within 7 days
  const dueSoonTasks = useMemo(() => {
    const today = new Date()
    return backlogTasks
      .filter(t => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        const daysUntilDue = differenceInDays(dueDate, today)
        return daysUntilDue >= 0 && daysUntilDue <= 7
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
  }, [backlogTasks])

  // Filtered and sorted regular backlog (excluding due soon)
  const filteredBacklog = useMemo(() => {
    let filtered = backlogTasks.filter(t => !dueSoonTasks.includes(t))

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      )
    }

    // Apply other filters
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
  }, [backlogTasks, dueSoonTasks, searchQuery, filters])

  const activeFiltersCount = countActiveFilters(filters)
  const totalBacklogCount = backlogTasks.length

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

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date())
    if (days === 0) return 'Scade oggi'
    if (days === 1) return 'Scade domani'
    return `Scade tra ${days}gg`
  }

  return (
    <>
      <AppShell
        title={
          <span className="text-base font-semibold">
            Backlog ({totalBacklogCount})
          </span>
        }
        headerAction={
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 -mr-2 relative"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Filtri"
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span
                className="absolute top-0 right-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: 'var(--color-destructive)',
                  color: 'white',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        }
      >
        <div ref={scrollContainerRef} className="h-full overflow-y-auto pb-24">
          {/* Search Bar */}
          <div className="p-4 pb-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: 'var(--color-background-section)' }}
            >
              <Search
                size={18}
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca impegni..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Current Sort Badge */}
          <div className="px-4 pb-3">
            <span
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: 'var(--color-background-section)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {getSortLabel(filters.sortBy)}
            </span>
          </div>

          {/* Due Soon Section */}
          {dueSoonTasks.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle
                  size={18}
                  style={{ color: 'var(--color-destructive)' }}
                />
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-destructive)' }}
                >
                  In scadenza ({dueSoonTasks.length})
                </h2>
              </div>
              <div className="space-y-2">
                {dueSoonTasks.map(task => (
                  <div key={task.id} className="relative">
                    <BacklogItem task={task} onTap={setSelectedTask} />
                    {task.due_date && (
                      <div
                        className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: 'var(--color-destructive)',
                          color: 'white',
                        }}
                      >
                        {getDaysUntilDue(task.due_date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backlog Section */}
          <div className="px-4">
            <h2
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Tutti ({filteredBacklog.length})
            </h2>
            {filteredBacklog.length > 0 ? (
              <div className="space-y-2">
                {filteredBacklog.map(task => (
                  <BacklogItem key={task.id} task={task} onTap={setSelectedTask} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {searchQuery
                    ? 'Nessun risultato trovato'
                    : 'Nessun impegno in backlog'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAB (Floating Action Button) */}
        <button
          onClick={() => setShowForm(true)}
          className={cn(
            'fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-20',
            showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          )}
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-label="Aggiungi impegno"
        >
          <Plus size={28} strokeWidth={2.5} color="white" />
        </button>
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {/* Filters Modal */}
      {showFilters && (
        <BacklogFilters
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  )
}
