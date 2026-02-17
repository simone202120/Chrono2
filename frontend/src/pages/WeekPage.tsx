import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { WeekView } from '@/components/calendar/WeekView'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
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
    await scheduleTask(task.id, `${dateString}T09:00:00`)
  }

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span className="text-sm font-bold tracking-tight text-slate-800">
            {weekRangeLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors text-slate-500"
              aria-label="Settimana precedente"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors text-slate-500"
              aria-label="Settimana successiva"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        }
      >
        <div className="px-4 pb-32 min-h-full">

          {/* Label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 mt-2">
            Panoramica settimana
          </p>

          {/* Week Grid */}
          <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
            <WeekView
              weekDates={weekDates}
              tasks={tasks.filter(t => t.scheduled_at !== null)}
              onDayPress={handleDayPress}
            />
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Tocca un giorno per vedere i dettagli · Trascina un impegno dal backlog
          </p>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-20 active:scale-95 transition-all duration-150"
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
    </>
  )
}
