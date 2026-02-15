import { useState, useMemo } from 'react'
import { SlidersHorizontal, Calendar, Plus } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { BacklogItem } from './BacklogItem'
import { TaskDetail } from '@/components/task/TaskDetail'
import type { Task } from '@/types/task'
import {
  BacklogFilters,
  countActiveFilters,
  type BacklogFiltersState,
  type SortOption,
} from './BacklogFilters'
import { cn } from '@/lib/utils'

interface BacklogPanelProps {
  onAddTask: () => void
}

/**
 * BacklogPanel - Draggable Task List
 * - Modern Header with integrated filters
 * - Clean list of draggable items
 * - Empty state with illustration
 */
export function BacklogPanel({ onAddTask }: BacklogPanelProps) {
  const tasks = useTaskStore(state => state.tasks)
  const loading = useTaskStore(state => state.loading)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-t-3xl border-t border-slate-100">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Backlog ({backlogTasks.length})
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition-all"
          >
            {getSortLabel(filters.sortBy)}
          </button>
          
          <button
            onClick={() => setShowFilters(true)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-sm active:scale-95 transition-all flex items-center gap-1.5",
              activeFiltersCount > 0 
                ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                : "bg-white border-slate-200 text-slate-600"
            )}
          >
            <SlidersHorizontal size={14} />
            {activeFiltersCount > 0 && <span>{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-[200px]">
        {backlogTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <Calendar size={28} strokeWidth={1.5} />
            </div>
            <p className="text-slate-500 font-medium mb-1">
              Tutto pulito!
            </p>
            <p className="text-slate-400 text-sm mb-6 max-w-[200px]">
              Il tuo backlog è vuoto. Aggiungi impegni da pianificare in futuro.
            </p>
            <button
              onClick={onAddTask}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm"
            >
              Aggiungi impegno
            </button>
          </div>
        ) : (
          <div className="px-4 pb-20 space-y-2.5">
            {backlogTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <BacklogItem task={task} onTap={setSelectedTask} />
              </div>
            ))}
            
            <button
              onClick={onAddTask}
              className="w-full py-3 mt-4 text-sm font-medium rounded-xl flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50/50 border border-indigo-100 border-dashed hover:bg-indigo-50 transition-colors"
            >
              <Plus size={18} />
              Aggiungi al backlog
            </button>
          </div>
        )}
      </div>

      {/* Filters modal */}
      {showFilters && (
        <BacklogFilters
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Task Detail modal */}
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  )
}
