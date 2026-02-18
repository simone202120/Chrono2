import { useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { toLocalISODateTime } from '@/lib/utils'
import type { Task, TaskWeight } from '@/types/task'

interface TaskFormProps {
  onClose: () => void
  existingTask?: Task
  initialScheduledDate?: string
}

/**
 * TaskForm - Bottom sheet for creating new tasks
 * - All fields for task creation
 * - Weight selection with colored pills
 * - Backlog / Calendar toggle
 * - Date and time pickers
 * - Adaptive CTA button
 */
export function TaskForm({ onClose, existingTask, initialScheduledDate }: TaskFormProps) {
  const user = useAuthStore(state => state.user)
  const createTask = useTaskStore(state => state.createTask)

  // Form state - pre-fill if editing existing task
  const [title, setTitle] = useState(existingTask?.title || '')
  const [description, setDescription] = useState(existingTask?.description || '')
  const [weight, setWeight] = useState<TaskWeight>(existingTask?.weight || 3)
  const [dueDate, setDueDate] = useState(existingTask?.due_date || '')
  const [destination, setDestination] = useState<'backlog' | 'calendar'>(
    initialScheduledDate || existingTask?.scheduled_at ? 'calendar' : 'backlog'
  )
  const [scheduledDate, setScheduledDate] = useState(
    initialScheduledDate ||
      existingTask?.scheduled_at?.split('T')[0] ||
      new Date().toISOString().split('T')[0]
  )
  const [scheduledTime, setScheduledTime] = useState(
    existingTask?.scheduled_at?.split('T')[1]?.slice(0, 5) || '09:00'
  )
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>(
    existingTask?.is_recurring ? 'weekly' : 'none'
  )
  // Recurrence details state
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    existingTask?.recurrence?.interval || 1
  )
  const [recurrenceWeekDays, setRecurrenceWeekDays] = useState<number[]>(
    existingTask?.recurrence?.days || []
  )
  const [recurrenceUntil, setRecurrenceUntil] = useState(
    existingTask?.recurrence?.until || ''
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return

    setIsSubmitting(true)

    const scheduledAt =
      destination === 'calendar' && scheduledDate
        ? toLocalISODateTime(scheduledDate, scheduledTime)
        : null

    const { error } = await createTask({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      weight,
      due_date: dueDate || null,
      scheduled_at: scheduledAt,
      completed_at: null,
      status: destination === 'backlog' ? 'backlog' : 'scheduled',
      is_recurring: recurrence !== 'none',
      recurrence:
        recurrence !== 'none'
          ? {
              type: recurrence,
              interval: recurrenceInterval,
              days: recurrence === 'weekly' ? recurrenceWeekDays : undefined,
              until: recurrenceUntil || null,
            }
          : null,
      parent_id: null,
    })

    setIsSubmitting(false)

    if (!error) {
      onClose()
    }
  }

  const weightColors: Record<TaskWeight, string> = {
    1: 'var(--color-weight-1)',
    2: 'var(--color-weight-2)',
    3: 'var(--color-weight-3)',
    4: 'var(--color-weight-4)',
    5: 'var(--color-weight-5)',
  }

  const RECURRENCE_OPTIONS: { value: typeof recurrence; label: string }[] = [
    { value: 'none', label: 'Mai' },
    { value: 'daily', label: 'Ogni giorno' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' },
    { value: 'custom', label: 'Custom' },
  ]

  const WEIGHT_LABELS: Record<TaskWeight, string> = {
    1: 'Lieve',
    2: 'Basso',
    3: 'Medio',
    4: 'Alto',
    5: 'Critico',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-backdrop"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <form
        className="w-full rounded-t-3xl max-h-[94vh] overflow-y-auto animate-slide-up"
        style={{ backgroundColor: 'var(--color-background-card)' }}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {existingTask ? 'Schedula impegno' : 'Nuovo impegno'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl active:bg-slate-100 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Titolo *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Descrivi l'impegno..."
              required
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl border text-base font-medium focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-background-section)',
                borderColor: 'transparent',
                caretColor: 'var(--color-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Note
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Aggiungi dettagli..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border text-sm resize-none focus:outline-none"
              style={{
                backgroundColor: 'var(--color-background-section)',
                borderColor: 'transparent',
              }}
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Peso / Impegno
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as TaskWeight[]).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    backgroundColor: weight === w ? weightColors[w] : 'var(--color-background-section)',
                    color: weight === w ? 'white' : 'var(--color-text-secondary)',
                    boxShadow: weight === w ? `0 4px 12px ${weightColors[w]}40` : 'none',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              {WEIGHT_LABELS[weight]}
            </p>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Scadenza
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-background-section)',
                borderColor: 'transparent',
              }}
            />
          </div>

          {/* Destination — card toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Destinazione
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDestination('backlog')}
                className="p-3.5 rounded-2xl text-left transition-all active:scale-95"
                style={{
                  backgroundColor: destination === 'backlog' ? 'var(--color-primary-light)' : 'var(--color-background-section)',
                  border: destination === 'backlog' ? '2px solid var(--color-primary)' : '2px solid transparent',
                }}
              >
                <div className="text-base font-bold mb-0.5" style={{ color: destination === 'backlog' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                  📋 Backlog
                </div>
                <div className="text-xs" style={{ color: destination === 'backlog' ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                  Decido dopo
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDestination('calendar')}
                className="p-3.5 rounded-2xl text-left transition-all active:scale-95"
                style={{
                  backgroundColor: destination === 'calendar' ? 'var(--color-primary-light)' : 'var(--color-background-section)',
                  border: destination === 'calendar' ? '2px solid var(--color-primary)' : '2px solid transparent',
                }}
              >
                <div className="text-base font-bold mb-0.5" style={{ color: destination === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                  📅 Calendario
                </div>
                <div className="text-xs" style={{ color: destination === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                  Schedula ora
                </div>
              </button>
            </div>

            {destination === 'calendar' && (
              <div className="mt-3 flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-background-section)', borderColor: 'transparent' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Ora
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-background-section)', borderColor: 'transparent' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurrence — horizontal chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Ricorrenza
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {RECURRENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRecurrence(opt.value)
                    if (opt.value === 'none') {
                      setRecurrenceWeekDays([])
                      setRecurrenceInterval(1)
                      setRecurrenceUntil('')
                    }
                  }}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: recurrence === opt.value ? 'var(--color-primary)' : 'var(--color-background-section)',
                    color: recurrence === opt.value ? 'white' : 'var(--color-text-secondary)',
                    boxShadow: recurrence === opt.value ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Weekly: Days selection */}
            {recurrence === 'weekly' && (
              <div className="mt-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Giorni della settimana
                </label>
                <div className="flex gap-1.5 justify-between">
                  {[
                    { day: 1, label: 'L' },
                    { day: 2, label: 'M' },
                    { day: 3, label: 'M' },
                    { day: 4, label: 'G' },
                    { day: 5, label: 'V' },
                    { day: 6, label: 'S' },
                    { day: 0, label: 'D' },
                  ].map(({ day, label }) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setRecurrenceWeekDays(prev =>
                          prev.includes(day)
                            ? prev.filter(d => d !== day)
                            : [...prev, day].sort()
                        )
                      }}
                      className="flex-1 aspect-square rounded-full font-bold text-sm transition-all active:scale-90"
                      style={{
                        backgroundColor: recurrenceWeekDays.includes(day)
                          ? 'var(--color-primary)'
                          : 'var(--color-background-section)',
                        color: recurrenceWeekDays.includes(day) ? 'white' : 'var(--color-text-primary)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom: Interval */}
            {recurrence === 'custom' && (
              <div className="mt-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Ogni quanti giorni?
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={e => setRecurrenceInterval(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-background-section)', border: 'none' }}
                />
              </div>
            )}

            {/* Until date */}
            {recurrence !== 'none' && (
              <div className="mt-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Termina il (opzionale)
                </label>
                <input
                  type="date"
                  value={recurrenceUntil}
                  onChange={e => setRecurrenceUntil(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-background-section)', border: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: 'var(--shadow-fab)',
            }}
          >
            {isSubmitting
              ? 'Salvataggio...'
              : destination === 'backlog'
                ? '📋 Salva nel Backlog'
                : '📅 Schedula'}
          </button>
        </div>
      </form>
    </div>
  )
}
