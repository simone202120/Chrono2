import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { WeekView } from '@/components/calendar/WeekView'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'

/**
 * WeekPage - Week view page
 * - Header with week range and navigation (← →)
 * - WeekView grid showing 7 days with task dots
 * - BacklogPanel below for task management
 * - Tap on day navigates to DayPage for that date
 */
export function WeekPage() {
  const navigate = useNavigate()
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const { weekDates, weekRangeLabel, goToNextWeek, goToPreviousWeek, setSelectedDate } =
    useCalendar()

  const handleDayPress = (date: Date) => {
    setSelectedDate(date)
    navigate('/')
  }

  return (
    <>
      <AppShell
        title={
          <span className="text-base font-semibold capitalize">
            {weekRangeLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2 -ml-2"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Settimana precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Settimana successiva"
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
        <div className="p-4 space-y-6">
          {/* Week View */}
          <WeekView
            weekDates={weekDates}
            tasks={tasks.filter(t => t.scheduled_at !== null)}
            onDayPress={handleDayPress}
          />

          {/* Backlog Panel */}
          <BacklogPanel onAddTask={() => setShowForm(true)} />
        </div>
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  )
}
