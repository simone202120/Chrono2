import { useState, useMemo } from 'react'
import { format, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Sparkles, CheckCircle2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

/**
 * DayPage - Main day view
 * - Clean date navigation header
 * - Day summary (task count, weight, completion)
 * - Agenda: scheduled tasks for the day
 * - FAB for quick add
 * - No embedded BacklogPanel (use dedicated Backlog tab)
 */
export function DayPage() {
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const {
    selectedDateISO,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    isToday,
    headerDateLabel,
  } = useCalendar()

  const { setNodeRef, isOver } = useDroppable({ id: selectedDateISO })

  const scheduleTask = useTaskStore(state => state.scheduleTask)

  const handleTaskDrop = async (task: Task, dateString: string) => {
    await scheduleTask(task.id, `${dateString}T09:00:00`)
  }

  // Tasks for selected date
  const allDayTasks = useMemo(() => {
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

  const activeTasks = useMemo(() => allDayTasks.filter(t => t.status !== 'done'), [allDayTasks])
  const completedTasks = useMemo(() => allDayTasks.filter(t => t.status === 'done'), [allDayTasks])

  const totalWeight = useMemo(
    () => activeTasks.reduce((sum, t) => sum + t.weight, 0),
    [activeTasks]
  )
  const completionRate = allDayTasks.length > 0
    ? Math.round((completedTasks.length / allDayTasks.length) * 100)
    : 0

  // Header date: capitalize first letter
  const headerLabel = useMemo(() => {
    const raw = headerDateLabel
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [headerDateLabel])

  // Summary weight color
  const weightColor = totalWeight === 0
    ? 'var(--color-success)'
    : totalWeight < 5
      ? 'var(--color-success)'
      : totalWeight < 10
        ? 'var(--color-warning)'
        : 'var(--color-destructive)'

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span
            className="text-base font-bold capitalize tracking-tight"
            style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
          >
            {headerLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-0">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno precedente"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNextDay}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno successivo"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="ml-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                Oggi
              </button>
            )}
          </div>
        }
      >
        <div className="min-h-full pb-32" style={{ touchAction: 'pan-y' }}>

          {/* Day Summary Card */}
          {allDayTasks.length > 0 && (
            <div
              className="mx-4 mt-3 mb-4 p-4 rounded-2xl flex items-center gap-4 animate-fade-in"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: 'var(--color-primary)' }}>
                  {isToday ? 'Oggi in agenda' : 'In agenda'}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                    {activeTasks.length}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                    {activeTasks.length === 1 ? 'impegno' : 'impegni'}
                  </span>
                  {completedTasks.length > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {completionRate}% ✓
                    </span>
                  )}
                </div>
              </div>
              {totalWeight > 0 && (
                <div
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold text-white text-lg shadow-sm"
                  style={{ backgroundColor: weightColor }}
                >
                  {totalWeight}
                  <span className="text-[9px] font-medium opacity-80">peso</span>
                </div>
              )}
            </div>
          )}

          {/* Agenda Section */}
          <div
            ref={setNodeRef}
            className={cn(
              'mx-4 transition-all duration-200 rounded-2xl',
              isOver && 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50/30'
            )}
          >
            {/* Active Tasks */}
            {activeTasks.length > 0 ? (
              <div className="space-y-2.5">
                {activeTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                  >
                    <SwipeableTaskCard task={task} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 animate-bounce-in"
                  style={{ backgroundColor: 'var(--color-primary-light)' }}
                >
                  <Sparkles size={36} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="font-semibold text-slate-700 mb-1">
                  {isToday ? 'Nessun impegno per oggi' : 'Nessun impegno'}
                </p>
                <p className="text-sm text-slate-400 mb-6 max-w-[220px]">
                  {isToday
                    ? 'Inizia aggiungendo qualcosa o trascina dal backlog'
                    : 'Questo giorno è libero. Aggiungi un impegno o trascina dal backlog'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  + Aggiungi impegno
                </button>
              </div>
            )}

            {/* Completed tasks collapsible section */}
            {completedTasks.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCompleted(p => !p)}
                  className="w-full flex items-center gap-2 px-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors active:opacity-70"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Completati ({completedTasks.length})
                  <span className="ml-auto text-slate-300">
                    {showCompleted ? '▲' : '▼'}
                  </span>
                </button>
                {showCompleted && (
                  <div className="space-y-2 mt-1">
                    {completedTasks.map(task => (
                      <SwipeableTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-20 active:scale-95 transition-all duration-150 animate-bounce-in"
          style={{
            backgroundColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-fab)',
          }}
          aria-label="Aggiungi impegno"
        >
          <Plus size={28} strokeWidth={2.5} color="white" />
        </button>
      </AppShell>

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          initialScheduledDate={selectedDateISO}
        />
      )}
    </>
  )
}
