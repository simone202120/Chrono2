import { useState, useMemo } from 'react'
import { format, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

/**
 * DayPage - Main day view page
 * - Header with date navigation (← →) and add button (+)
 * - Agenda section: tasks scheduled for selected day
 * - Total weight badge with color coding
 * - Backlog section below
 * - Horizontal swipe to navigate between days
 */
export function DayPage() {
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const {
    selectedDateISO,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    isToday,
    dateLabel,
    headerDateLabel,
  } = useCalendar()

  // Drop zone for the day
  const { setNodeRef, isOver } = useDroppable({
    id: selectedDateISO,
  })

  // Get tasks for selected date
  const dayTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (!task.scheduled_at) return false
        const taskDate = format(startOfDay(new Date(task.scheduled_at)), 'yyyy-MM-dd')
        return taskDate === selectedDateISO
      })
      .sort((a, b) => {
        if (!a.scheduled_at || !b.scheduled_at) return 0
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      })
  }, [tasks, selectedDateISO])

  // Calculate total weight for the day
  const totalWeight = useMemo(() => {
    return dayTasks.reduce((sum, task) => sum + task.weight, 0)
  }, [dayTasks])

  // Weight badge color
  const weightColor = useMemo(() => {
    if (totalWeight < 5) return 'var(--color-success)' // Green
    if (totalWeight < 10) return 'var(--color-warning)' // Yellow
    return 'var(--color-destructive)' // Red
  }, [totalWeight])

  const scheduleTask = useTaskStore(state => state.scheduleTask)

  // Drag & drop handlers
  const handleTaskDrop = async (task: Task, dateString: string) => {
    // Direct schedule to 09:00 of the target day
    const scheduledAt = `${dateString}T09:00:00`
    await scheduleTask(task.id, scheduledAt)
  }

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span
            className="text-base font-semibold capitalize"
            style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
          >
            {headerDateLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              className="p-2 -ml-2"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextDay}
              className="p-2"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno successivo"
            >
              <ChevronRight size={20} />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="ml-1 px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
                aria-label="Vai a oggi"
              >
                Oggi
              </button>
            )}
          </div>
        }
        headerAction={
          <button
            onClick={() => setShowForm(true)}
            className="p-2 -mr-2"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Aggiungi impegno"
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        }
      >
        <div
          className="min-h-full"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Agenda Section */}
          <div
            ref={setNodeRef}
            className={cn(
              "p-4 transition-colors duration-200 rounded-3xl mx-2 mt-2",
              isOver ? "bg-indigo-50/50 ring-2 ring-indigo-500 ring-offset-2" : ""
            )}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {dateLabel}
              </h2>
              {dayTasks.length > 0 && (
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    color: 'white',
                    backgroundColor: weightColor,
                  }}
                >
                  Peso totale: {totalWeight}
                </span>
              )}
            </div>

            {/* Task List */}
            {dayTasks.length > 0 ? (
              <div className="space-y-2">
                {dayTasks.map(task => (
                  <SwipeableTaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div
                className="flex flex-col items-center justify-center py-12 px-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-background-section)' }}
              >
                <Calendar
                  size={48}
                  strokeWidth={1.5}
                  style={{ color: 'var(--color-text-tertiary)' }}
                  className="mb-3"
                />
                <p
                  className="text-sm text-center mb-4"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Nessun impegno.
                  <br />
                  Trascina dal backlog o aggiungi +
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 text-sm font-medium rounded-full text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Aggiungi impegno
                </button>
              </div>
            )}
          </div>

          {/* Backlog Section */}
          <div className="mt-6 px-4 pb-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3 px-2">
              Backlog
            </h2>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <BacklogPanel onAddTask={() => setShowForm(true)} />
            </div>
          </div>
        </div>
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  )
}
