import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { BacklogPanel } from '@/components/backlog/BacklogPanel'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { Plus } from 'lucide-react'

export function BacklogPage() {
  const [showForm, setShowForm] = useState(false)
  const fetchTasks = useTaskStore(state => state.fetchTasks)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <>
      <AppShell
        title="Backlog"
        headerAction={
          <button
            onClick={() => setShowForm(true)}
            className="p-2"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Aggiungi al backlog"
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        }
      >
        <BacklogPanel onAddTask={() => setShowForm(true)} />
      </AppShell>

      {/* Task Form Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  )
}
