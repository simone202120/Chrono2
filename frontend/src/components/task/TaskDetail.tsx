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
 * TaskDetail - Bottom sheet with full task info and actions
 * - Weight badge + title header
 * - Info chips row (date, time, recurrence)
 * - Notes section
 * - 2-column action grid + delete link
 * - Postpone inline picker
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
    if (!error) onClose()
  }

  const handleMoveToBacklog = async () => {
    const { error } = await moveToBacklog(task.id)
    if (!error) onClose()
  }

  const handlePostpone = async () => {
    if (!postponeDate) return
    const { error } = await postponeTask(task.id, `${postponeDate}T${postponeTime}:00`)
    if (!error) onClose()
  }

  const handleDelete = async () => {
    if (window.confirm('Eliminare questo impegno?')) {
      const { error } = await deleteTask(task.id)
      if (!error) onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-backdrop"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl max-h-[92vh] overflow-y-auto animate-slide-up"
        style={{ backgroundColor: 'var(--color-background-card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-start gap-3 mt-3 mb-5">
            <WeightBadge weight={task.weight} size="lg" />
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-xl font-bold leading-tight text-slate-900">
                {task.title}
              </h2>
              {isCompleted && (
                <span className="text-xs font-semibold text-emerald-500 mt-0.5 block">
                  Completato
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-1">
              {onEdit && !isCompleted && (
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="p-2 rounded-xl active:bg-slate-100 transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                  aria-label="Modifica"
                >
                  <Edit2 size={19} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl active:bg-slate-100 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="Chiudi"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {task.scheduled_at && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                <Clock size={13} />
                {format(new Date(task.scheduled_at), "d MMM 'alle' HH:mm", { locale: it })}
              </div>
            )}
            {task.due_date && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: 'var(--color-background-section)', color: 'var(--color-text-secondary)' }}
              >
                <Calendar size={13} />
                Scade il {format(new Date(task.due_date), 'd MMMM', { locale: it })}
              </div>
            )}
            {task.is_recurring && task.recurrence && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: '#eef2ff', color: 'var(--color-primary)' }}
              >
                <RefreshCw size={13} />
                {task.recurrence.type === 'daily' && 'Ogni giorno'}
                {task.recurrence.type === 'weekly' && 'Ogni settimana'}
                {task.recurrence.type === 'monthly' && 'Ogni mese'}
                {task.recurrence.type === 'custom' && `Ogni ${task.recurrence.interval}gg`}
              </div>
            )}
          </div>

          {/* Notes */}
          {task.description && (
            <div
              className="p-4 rounded-2xl mb-5"
              style={{ backgroundColor: 'var(--color-background-section)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Note
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Actions — 2-column grid */}
          {!isCompleted && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Complete */}
              <button
                type="button"
                onClick={handleComplete}
                className="py-3.5 px-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 col-span-2 active:scale-[0.98] transition-all"
                style={{ backgroundColor: 'var(--color-success)' }}
              >
                <CheckCircle2 size={20} />
                Segna come fatto
              </button>

              {/* Move to backlog */}
              {isScheduled && (
                <button
                  type="button"
                  onClick={handleMoveToBacklog}
                  className="py-3 px-3 rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all"
                  style={{ backgroundColor: 'var(--color-background-section)', color: 'var(--color-text-primary)' }}
                >
                  <CornerDownLeft size={18} />
                  <span>Al backlog</span>
                </button>
              )}

              {/* Postpone */}
              <button
                type="button"
                onClick={() => setShowPostponePicker(!showPostponePicker)}
                className="py-3 px-3 rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all"
                style={{
                  backgroundColor: showPostponePicker ? 'var(--color-primary-light)' : 'var(--color-background-section)',
                  color: showPostponePicker ? 'var(--color-primary)' : 'var(--color-text-primary)',
                }}
              >
                <CalendarClock size={18} />
                <span>Rinvia</span>
              </button>
            </div>
          )}

          {/* Postpone picker */}
          {showPostponePicker && (
            <div
              className="p-4 rounded-2xl space-y-3 mb-3 animate-fade-in"
              style={{ backgroundColor: 'var(--color-background-section)' }}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={postponeDate}
                    onChange={e => setPostponeDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-background-card)', borderColor: 'var(--color-separator)' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Ora
                  </label>
                  <input
                    type="time"
                    value={postponeTime}
                    onChange={e => setPostponeTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-background-card)', borderColor: 'var(--color-separator)' }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handlePostpone}
                disabled={!postponeDate}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Conferma rinvio
              </button>
            </div>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2.5 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ color: 'var(--color-destructive)', backgroundColor: '#fef2f2' }}
          >
            <Trash2 size={16} />
            Elimina impegno
          </button>
        </div>
      </div>
    </div>
  )
}
