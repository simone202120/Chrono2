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
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types/task'
import { getWeightColor } from '@/lib/utils'

interface TaskDetailProps {
  task: Task
  onClose: () => void
  onEdit?: (task: Task) => void
}

/**
 * TaskDetail - Revolut Style Bottom Sheet
 * - Modern design with accent colors
 * - Action buttons with shadows
 * - Dark mode support
 */
export function TaskDetail({ task, onClose, onEdit }: TaskDetailProps) {
  const { completeTask, moveToBacklog, postponeTask, deleteTask } = useTaskStore()
  const [showPostponePicker, setShowPostponePicker] = useState(false)
  const [postponeDate, setPostponeDate] = useState('')
  const [postponeTime, setPostponeTime] = useState('09:00')

  const isCompleted = task.status === 'done'
  const isScheduled = task.scheduled_at !== null
  const weightColor = getWeightColor(task.weight)

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
    const newScheduledAt = `${postponeDate}T${postponeTime}:00`
    const { error } = await postponeTask(task.id, newScheduledAt)
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
      className="fixed inset-0 z-50 flex items-end animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-in"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderRadius: '28px 28px 0 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-4 sticky top-0 bg-inherit z-10">
          <div 
            className="w-10 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--border-default)' }}
          />
        </div>

        {/* Header with Weight */}
        <div className="px-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Weight Badge */}
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge mb-3"
                style={{ backgroundColor: weightColor + '15' }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: weightColor }}
                />
                <span 
                  className="text-sm font-bold"
                  style={{ color: weightColor }}
                >
                  Peso {task.weight}
                </span>
              </div>
              
              {/* Title */}
              <h2 
                className="text-2xl font-bold leading-tight"
                style={{ 
                  color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </h2>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="p-2.5 rounded-full transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Edit2 size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 pb-6 space-y-4">
          {/* Due Date */}
          <div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-input)' }}
          >
            <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Scadenza
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {task.due_date
                  ? format(new Date(task.due_date), 'd MMMM yyyy', { locale: it })
                  : 'Nessuna scadenza'}
              </p>
            </div>
          </div>

          {/* Scheduled */}
          <div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-input)' }}
          >
            <Clock size={20} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Schedulato
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {task.scheduled_at
                  ? format(new Date(task.scheduled_at), "d MMMM 'alle' HH:mm", { locale: it })
                  : 'Nel backlog'}
              </p>
            </div>
          </div>

          {/* Recurring */}
          {task.is_recurring && task.recurrence && (
            <div 
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'var(--accent-primary) + 10' }}
            >
              <RefreshCw size={20} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                  Ricorrenza
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {task.recurrence.type === 'daily' && 'Ogni giorno'}
                  {task.recurrence.type === 'weekly' && 'Ogni settimana'}
                  {task.recurrence.type === 'monthly' && 'Ogni mese'}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {task.description && (
            <div className="pt-2">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Note
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {task.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-8 space-y-3">
          {/* Complete */}
          {!isCompleted && (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-4 rounded-card font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-success)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(0, 180, 166, 0.3)',
              }}
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
              className="w-full py-4 rounded-card font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
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
                className="w-full py-4 rounded-card font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <CalendarClock size={20} />
                Rinvia
              </button>

              {showPostponePicker && (
                <div 
                  className="mt-3 p-4 rounded-card space-y-3"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label 
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Data
                      </label>
                      <input
                        type="date"
                        value={postponeDate}
                        onChange={e => setPostponeDate(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label 
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Ora
                      </label>
                      <input
                        type="time"
                        value={postponeTime}
                        onChange={e => setPostponeTime(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePostpone}
                    disabled={!postponeDate}
                    className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                    style={{ 
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-inverse)',
                    }}
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
            className="w-full py-3 rounded-card font-medium text-sm flex items-center justify-center gap-2 transition-all"
            style={{ color: 'var(--color-destructive)' }}
          >
            <Trash2 size={16} />
            Elimina impegno
          </button>
        </div>
      </div>
    </div>
  )
}
