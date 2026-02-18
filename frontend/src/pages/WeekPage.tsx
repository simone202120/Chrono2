import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { WeekView } from '@/components/calendar/WeekView'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import { toLocalISODateTime } from '@/lib/utils'
import type { Task } from '@/types/task'

/**
 * WeekPage - Week overview
 * - Clean header with week range
 * - Full-focus week grid (no embedded BacklogPanel)
 * - FAB to add new task
 */
export function WeekPage() {
  const navigate = useNavigate()
  const scheduleTask = useTaskStore(state => state.scheduleTask)
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const { weekDates, weekRangeLabel, goToNextWeek, goToPreviousWeek, setSelectedDate } =
    useCalendar()

  const handleDayPress = (date: Date) => {
    setSelectedDate(date)
    navigate('/')
  }

  const handleTaskDrop = async (task: Task, dateString: string) => {
    await scheduleTask(task.id, toLocalISODateTime(dateString, '09:00'))
  }

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span
            className="text-[17px] font-semibold tracking-[-0.3px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {weekRangeLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-0">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Settimana precedente"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Settimana successiva"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        }
      >
        <div className="px-2 pb-32 min-h-full">

          {/* Label */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3 mt-2 px-2"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Panoramica settimana
          </p>

          {/* Week Grid */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: 'var(--shadow-card)',
              backgroundColor: 'var(--color-background-card)',
            }}
          >
            <WeekView
              weekDates={weekDates}
              tasks={tasks.filter(t => t.scheduled_at !== null)}
              onDayPress={handleDayPress}
            />
          </div>

          {/* Hint */}
          <p
            className="text-center text-xs mt-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Tocca un giorno · Trascina un impegno dal backlog
          </p>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 flex items-center gap-2 px-4 h-14 rounded-2xl z-20 active:scale-95 transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            boxShadow: 'var(--shadow-fab)',
          }}
          aria-label="Aggiungi impegno"
        >
          <Plus size={22} strokeWidth={2.5} color="white" />
          <span className="text-white font-bold text-sm pr-1">Nuovo</span>
        </button>
      </AppShell>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  )
}
