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
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">Backlog</span>
            {totalBacklogCount > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {totalBacklogCount}
              </span>
            )}
          </div>
        }
        headerAction={
          <button
            onClick={() => setShowFilters(true)}
            className="relative p-2 rounded-xl active:bg-slate-100 transition-colors"
            style={{ color: activeFiltersCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            aria-label="Filtri"
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: 'var(--color-destructive)' }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        }
      >
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">

          {/* Search Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'var(--color-background-section)' }}>
              <Search size={17} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca impegni..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 text-xs font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sort + Filter chips row */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--color-background-section)',
                color: 'var(--color-text-secondary)',
              }}
            >
              ↕ {getSortLabel(filters.sortBy)}
            </button>
            {activeFiltersCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                {activeFiltersCount} filtri attivi
              </span>
            )}
          </div>

          {/* Due Soon Section */}
          {dueSoonTasks.length > 0 && (
            <div className="px-4 mb-5">
              <div
                className="p-4 rounded-2xl"
                style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                    In scadenza · {dueSoonTasks.length}
                  </h2>
                </div>
                <div className="space-y-2">
                  {dueSoonTasks.map(task => (
                    <div key={task.id} className="relative">
                      <BacklogItem task={task} onTap={setSelectedTask} />
                      {task.due_date && (
                        <div
                          className="absolute top-2.5 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                          style={{ backgroundColor: 'var(--color-destructive)' }}
                        >
                          {getDaysUntilDue(task.due_date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Backlog */}
          <div className="px-4 pb-32">
            {filteredBacklog.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Tutti · {filteredBacklog.length}
                </p>
                <div className="space-y-2.5">
                  {filteredBacklog.map((task, index) => (
                    <div
                      key={task.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
                    >
                      <BacklogItem task={task} onTap={setSelectedTask} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-background-section)' }}
                >
                  <span className="text-4xl">{searchQuery ? '🔍' : '📋'}</span>
                </div>
                <p className="font-semibold text-slate-700 mb-1">
                  {searchQuery ? 'Nessun risultato' : 'Backlog vuoto'}
                </p>
                <p className="text-sm text-slate-400 max-w-[200px]">
                  {searchQuery
                    ? `Nessun impegno corrisponde a "${searchQuery}"`
                    : 'Aggiungi impegni da pianificare in futuro'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowForm(true)}
          className={cn(
            'fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-20 transition-all duration-300',
            showFAB ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-90'
          )}
          style={{
            backgroundColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-fab)',
          }}
          aria-label="Aggiungi impegno"
        >
          <Plus size={28} strokeWidth={2.5} color="white" />
        </button>
      </AppShell>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {showFilters && (
        <BacklogFilters
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  )
}
