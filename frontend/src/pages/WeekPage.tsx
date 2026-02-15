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
 * WeekPage - Modern Week View
 * - Focus on the timeline
 * - Removed backlog split
 * - Clean header
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
    // Direct schedule to 09:00 of the target day
    const scheduledAt = `${dateString}T09:00:00`
    await scheduleTask(task.id, scheduledAt)
  }

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span className="text-lg font-bold tracking-tight text-slate-800">
            {weekRangeLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600"
              aria-label="Settimana precedente"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600"
              aria-label="Settimana successiva"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        }
        headerAction={
          <button
            onClick={() => setShowForm(true)}
            className="p-2 -mr-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            aria-label="Aggiungi impegno"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        }
      >
        <div className="p-4 min-h-full bg-slate-50">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider ml-2">
              Panoramica Settimanale
            </h2>
          </div>
          
          {/* Week View Grid */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <WeekView
              weekDates={weekDates}
              tasks={tasks.filter(t => t.scheduled_at !== null)}
              onDayPress={handleDayPress}
            />
          </div>

          {/* Backlog Panel */}
          <div className="pb-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3 ml-2">
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
