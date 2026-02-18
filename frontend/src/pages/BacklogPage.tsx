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
 * BacklogPage - Revolut Modern Style
 * - Modern search bar
 * - Clean filters
 * - Revolut-style FAB
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

  // Filtered and sorted regular backlog
  const filteredBacklog = useMemo(() => {
    let filtered = backlogTasks.filter(t => !dueSoonTasks.includes(t))

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      )
    }

    if (filters.dueSoon) {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      filtered = filtered.filter(
        t => t.due_date && new Date(t.due_date) <= sevenDaysFromNow
      )
    }

    if (filters.noDueDate) filtered = filtered.filter(t => !t.due_date)
    if (filters.highPriority) filtered = filtered.filter(t => t.weight >= 4)
    if (filters.recurringOnly) filtered = filtered.filter(t => t.is_recurring)

    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'weight-desc': return b.weight - a.weight
        case 'weight-asc': return a.weight - b.weight
        case 'due-date-asc':
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'created-at-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default: return 0
      }
    })

    return sorted
  }, [backlogTasks, dueSoonTasks, searchQuery, filters])

  const activeFiltersCount = countActiveFilters(filters)
  const totalBacklogCount = backlogTasks.length

  const getSortLabel = (sortBy: SortOption) => {
    const labels: Record<SortOption, string> = {
      'weight-desc': 'Peso ↓',
      'weight-asc': 'Peso ↑',
      'due-date-asc': 'Scadenza ↑',
      'created-at-desc': 'Data ↓',
    }
    return labels[sortBy]
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date())
    if (days === 0) return 'Oggi'
    if (days === 1) return 'Domani'
    return `${days}gg`
  }

  return (
    <>
      <AppShell
        title={
          <span 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Backlog ({totalBacklogCount})
          </span>
        }
        headerAction={
          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 rounded-full relative transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Filtri"
          >
            <SlidersHorizontal size={18} />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold"
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
        <div ref={scrollContainerRef} className="h-full overflow-y-auto no-scrollbar pb-24">
          {/* Search Bar */}
          <div className="p-4 pb-3">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-card"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca impegni..."
                className="flex-1 bg-transparent border-none outline-none text-base"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Sort Badge */}
          <div className="px-4 pb-4">
            <span
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
            >
              {getSortLabel(filters.sortBy)}
            </span>
          </div>

          {/* Due Soon Section */}
          {dueSoonTasks.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-destructive) + 15' }}
                >
                  <AlertCircle size={18} style={{ color: 'var(--color-destructive)' }} />
                </div>
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: 'var(--color-destructive)' }}
                >
                  In scadenza ({dueSoonTasks.length})
                </h2>
              </div>
              <div className="space-y-3">
                {dueSoonTasks.map(task => (
                  <div key={task.id} className="relative">
                    <BacklogItem task={task} onTap={setSelectedTask} />
                    {task.due_date && (
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full"
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
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tutti ({filteredBacklog.length})
            </h2>
            {filteredBacklog.length > 0 ? (
              <div className="space-y-3">
                {filteredBacklog.map(task => (
                  <BacklogItem key={task.id} task={task} onTap={setSelectedTask} />
                ))}
              </div>
            ) : (
              <div 
                className="text-center py-12 rounded-card"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <p style={{ color: 'var(--text-tertiary)' }}>
                  {searchQuery ? 'Nessun risultato trovato' : 'Nessun impegno in backlog'}
                </p>
              </div>
            )}
          </div>
        </div>
      </AppShell>

      {/* Floating FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-40',
          showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        )}
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)',
          boxShadow: '0 4px 20px var(--accent-glow)',
        }}
        aria-label="Aggiungi impegno"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

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
