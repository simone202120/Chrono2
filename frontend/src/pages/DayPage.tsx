import { useState, useMemo } from 'react'
import { format, startOfDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import type { Task } from '@/types/task'
import { getWeightColor } from '@/lib/utils'

/**
 * DayPage - Revolut Modern Style
 * - Large date header
 * - Modern weight badge
 * - Clean card layout
 * - Floating FAB
 */
export function DayPage() {
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const {
    selectedDateISO,
    selectedDate,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    isToday,
  } = useCalendar()

  const { setNodeRef, isOver } = useDroppable({ id: selectedDateISO })

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

  // Calculate total weight
  const totalWeight = useMemo(() => {
    return dayTasks.reduce((sum, task) => sum + task.weight, 0)
  }, [dayTasks])

  const scheduleTask = useTaskStore(state => state.scheduleTask)

  const handleTaskDrop = async (task: Task, dateString: string) => {
    const scheduledAt = `${dateString}T09:00:00`
    await scheduleTask(task.id, scheduledAt)
  }

  // Format date for display
  const formattedDate = useMemo(() => {
    if (isToday) return 'Oggi'
    return format(selectedDate, 'EEEE d MMMM', { locale: it })
  }, [selectedDate, isToday])

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <div className="flex flex-col items-center">
            <span 
              className="text-xs font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {format(selectedDate, 'MMMM yyyy', { locale: it })}
            </span>
            <span 
              className="text-xl font-bold capitalize"
              style={{ 
                color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
              }}
            >
              {formattedDate}
            </span>
          </div>
        }
        headerLeftAction={
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Giorno precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextDay}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Giorno successivo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        }
        headerAction={
          !isToday ? (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-bold rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
              }}
            >
              Oggi
            </button>
          ) : null
        }
      >
        <div className="min-h-full" style={{ touchAction: 'pan-y' }}>
          {/* Date Navigation & Total Weight */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              <h2 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Agenda
              </h2>
              {dayTasks.length > 0 && (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ 
                      backgroundColor: totalWeight > 10 
                        ? 'var(--color-destructive)' 
                        : totalWeight > 5 
                          ? 'var(--color-warning)' 
                          : 'var(--accent-primary)',
                    }}
                  />
                  <span 
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Peso {totalWeight}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Agenda Section - Drop Zone */}
          <div
            ref={setNodeRef}
            className="rounded-card p-4 mb-6 transition-all duration-200"
            style={{
              backgroundColor: isOver ? 'var(--accent-primary) + 08' : 'var(--bg-card)',
              border: isOver ? '2px dashed var(--accent-primary)' : '1px solid var(--border-subtle)',
            }}
          >
            {/* Task List */}
            {dayTasks.length > 0 ? (
              <div className="space-y-3">
                {dayTasks.map(task => (
                  <SwipeableTaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div
                className="flex flex-col items-center justify-center py-16 px-6 rounded-xl"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <Calendar size={28} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p 
                  className="text-base font-semibold text-center mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Nessun impegno
                </p>
                <p 
                  className="text-sm text-center mb-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Trascina dal backlog o aggiungi
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 text-sm font-bold rounded-full transition-all"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-inverse)',
                    boxShadow: '0 4px 16px var(--accent-glow)',
                  }}
                >
                  Aggiungi impegno
                </button>
              </div>
            )}
          </div>

          {/* Backlog Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Backlog
              </h2>
            </div>
            <BacklogPanel onAddTask={() => setShowForm(true)} />
          </div>
        </div>
      </AppShell>

      {/* Floating FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
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
    </>
  )
}
