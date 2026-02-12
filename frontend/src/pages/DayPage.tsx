import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { Plus } from 'lucide-react'
import type { Task } from '@/types/task'

// Demo tasks for Sprint 1
const demoTasks: Task[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Sprint 1 completato! 🎉',
    description: 'Tutti i 6 task implementati con successo',
    weight: 5,
    status: 'done',
    scheduled_at: new Date().toISOString(),
    due_date: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    is_recurring: false,
    recurrence: null,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Implementare Task Form',
    description: 'Prossimo: Sprint 2 Task 2.1',
    weight: 3,
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    due_date: new Date(Date.now() + 172800000).toISOString(),
    completed_at: null,
    is_recurring: true,
    recurrence: { type: 'weekly', interval: 1, days: [1, 3, 5] },
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function DayPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <AppShell
        title="Oggi"
        headerAction={
          <button
            onClick={() => setShowForm(true)}
            className="p-2"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Aggiungi impegno"
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        }
      >
      <div className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Oggi
          </h2>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Peso totale: {demoTasks.reduce((sum, t) => sum + t.weight, 0)}
          </span>
        </div>

        {/* Task Cards */}
        <div className="space-y-2">
          {demoTasks.map(task => (
            <SwipeableTaskCard key={task.id} task={task} onClick={() => {}} />
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 text-sm font-medium rounded-xl"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-background-section)',
          }}
        >
          + Aggiungi impegno oggi
        </button>
      </div>
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  )
}
