import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { WeekView } from '@/components/calendar/WeekView'
import { TaskForm } from '@/components/task/TaskForm'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import type { Task } from '@/types/task'

/**
 * WeekPage - Revolut Modern Style
 * - Clean week grid
 * - Modern navigation
 * - Integrated backlog
 */
export function WeekPage() {
  const navigate = useNavigate()
  const scheduleTask = useTaskStore(state => state.scheduleTask)
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const { weekRangeLabel, goToNextWeek, goToPreviousWeek, setSelectedDate } = useCalendar()

  const handleDayPress = (date: Date) => {
    setSelectedDate(date)
    navigate('/')
  }

  const handleTaskDrop = async (task: Task, dateString: string) => {
    const scheduledAt = `${dateString}T09:00:00`
    await scheduleTask(task.id, scheduledAt)
  }

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {weekRangeLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Settimana precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Settimana successiva"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        }
      >
        <div className="min-h-full">
          {/* Week Grid */}
          <div 
            className="rounded-card p-4 mb-6"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <WeekView
              tasks={tasks.filter(t => t.scheduled_at !== null)}
              onDayPress={handleDayPress}
            />
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
