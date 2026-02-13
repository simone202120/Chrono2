import { useState, useMemo, useRef } from 'react'
import { format, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import type { Task } from '@/types/task'

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
  const [droppedTask, setDroppedTask] = useState<Task | null>(null)
  const [droppedDate, setDroppedDate] = useState<string | null>(null)
  const {
    selectedDateISO,
    goToNextDay,
    goToPreviousDay,
    isToday,
    dateLabel,
    headerDateLabel,
  } = useCalendar()

  // Swipe detection
  const startXRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

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

  // Drag & drop handlers
  const handleTaskDrop = (task: Task, dateString: string) => {
    setDroppedTask(task)
    setDroppedDate(dateString)
  }

  const handleCloseScheduleForm = () => {
    setDroppedTask(null)
    setDroppedDate(null)
  }

  // Swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX
    setIsDragging(true)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaX = e.clientX - startXRef.current
    const SWIPE_THRESHOLD = 50

    if (deltaX > SWIPE_THRESHOLD) {
      // Swipe right → previous day
      goToPreviousDay()
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // Swipe left → next day
      goToNextDay()
    }
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
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Agenda Section */}
          <div className="p-4">
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
          <div className="mt-6">
            <BacklogPanel onAddTask={() => setShowForm(true)} />
          </div>
        </div>
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {/* Schedule Task Form (from drag & drop) */}
      {droppedTask && droppedDate && (
        <TaskForm
          existingTask={droppedTask}
          initialScheduledDate={droppedDate}
          onClose={handleCloseScheduleForm}
        />
      )}
    </>
  )
}
