import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  X,
  Edit2,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle2,
  CornerDownLeft,
  CalendarClock,
  Trash2,
} from 'lucide-react'
import { WeightBadge } from './WeightBadge'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types/task'

interface TaskDetailProps {
  task: Task
  onClose: () => void
  onEdit?: (task: Task) => void
}

/**
 * TaskDetail - Bottom sheet showing full task details
 * - Displays all task information
 * - Action buttons: Complete / Move to Backlog / Postpone / Delete
 * - "Postpone" opens inline date picker
 * - "Edit" opens TaskForm pre-filled
 */
export function TaskDetail({ task, onClose, onEdit }: TaskDetailProps) {
  const { completeTask, moveToBacklog, postponeTask, deleteTask } = useTaskStore()
  const [showPostponePicker, setShowPostponePicker] = useState(false)
  const [postponeDate, setPostponeDate] = useState('')
  const [postponeTime, setPostponeTime] = useState('09:00')

  const isCompleted = task.status === 'done'
  const isScheduled = task.scheduled_at !== null

  const handleComplete = async () => {
    const { error } = await completeTask(task.id)
    if (!error) {
      onClose()
    }
  }

  const handleMoveToBacklog = async () => {
    const { error } = await moveToBacklog(task.id)
    if (!error) {
      onClose()
    }
  }

  const handlePostpone = async () => {
    if (!postponeDate) return

    const newScheduledAt = `${postponeDate}T${postponeTime}:00`
    const { error } = await postponeTask(task.id, newScheduledAt)
    if (!error) {
      onClose()
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Eliminare questo impegno?')) {
      const { error } = await deleteTask(task.id)
      if (!error) {
        onClose()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-background-card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-separator)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <WeightBadge weight={task.weight} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold mb-1">{task.title}</h2>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-2"
              style={{ color: 'var(--color-primary)' }}
              aria-label="Modifica"
            >
              <Edit2 size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Task details */}
        <div className="space-y-4 mb-6">
          {/* Due date */}
          <div className="flex items-center gap-3">
            <Calendar
              size={18}
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <span className="text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Scadenza:{' '}
              </span>
              {task.due_date
                ? format(new Date(task.due_date), 'd MMMM yyyy', { locale: it })
                : 'Nessuna'}
            </span>
          </div>

          {/* Scheduled at */}
          <div className="flex items-center gap-3">
            <Clock
              size={18}
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <span className="text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Schedulato:{' '}
              </span>
              {task.scheduled_at
                ? format(
                    new Date(task.scheduled_at),
                    "d MMMM yyyy 'alle' HH:mm",
                    { locale: it }
                  )
                : 'Nel backlog'}
            </span>
          </div>

          {/* Recurring */}
          {task.is_recurring && task.recurrence && (
            <div className="flex items-center gap-3">
              <RefreshCw
                size={18}
                style={{ color: 'var(--color-primary)' }}
              />
              <span className="text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Ricorrenza:{' '}
                </span>
                {task.recurrence.type === 'daily' && 'Ogni giorno'}
                {task.recurrence.type === 'weekly' && 'Ogni settimana'}
                {task.recurrence.type === 'monthly' && 'Ogni mese'}
              </span>
            </div>
          )}

          {/* Notes */}
          {task.description && (
            <div className="pt-3 border-t" style={{ borderColor: 'var(--color-separator)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Note:
              </p>
              <p className="text-sm mt-1">{task.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Complete */}
          {!isCompleted && (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              <CheckCircle2 size={20} />
              Completa
            </button>
          )}

          {/* Move to Backlog */}
          {isScheduled && !isCompleted && (
            <button
              type="button"
              onClick={handleMoveToBacklog}
              className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-background-section)',
                color: 'var(--color-text-primary)',
              }}
            >
              <CornerDownLeft size={20} />
              Sposta in backlog
            </button>
          )}

          {/* Postpone */}
          {!isCompleted && (
            <div>
              <button
                type="button"
                onClick={() => setShowPostponePicker(!showPostponePicker)}
                className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-background-section)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <CalendarClock size={20} />
                Rinvia
              </button>

              {showPostponePicker && (
                <div className="mt-3 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--color-background-section)' }}>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Data
                      </label>
                      <input
                        type="date"
                        value={postponeDate}
                        onChange={e => setPostponeDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                        style={{
                          backgroundColor: 'var(--color-background-card)',
                          borderColor: 'var(--color-separator)',
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Ora
                      </label>
                      <input
                        type="time"
                        value={postponeTime}
                        onChange={e => setPostponeTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                        style={{
                          backgroundColor: 'var(--color-background-card)',
                          borderColor: 'var(--color-separator)',
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePostpone}
                    disabled={!postponeDate}
                    className="w-full py-2 px-4 rounded-xl font-medium text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Conferma rinvio
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
            style={{ color: 'var(--color-destructive)' }}
          >
            <Trash2 size={16} />
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}
