import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import type { Task, TaskWeight } from '@/types/task'
import { getWeightColor } from '@/lib/utils'

interface TaskFormProps {
  onClose: () => void
  existingTask?: Task
  initialScheduledDate?: string
}

/**
 * TaskForm - Revolut Style Bottom Sheet
 * - Rounded top corners (28px)
 * - Clean input design
 * - Modern weight selector
 * - Dark mode support
 */
export function TaskForm({ onClose, existingTask, initialScheduledDate }: TaskFormProps) {
  const user = useAuthStore(state => state.user)
  const createTask = useTaskStore(state => state.createTask)

  const [title, setTitle] = useState(existingTask?.title || '')
  const [description, setDescription] = useState(existingTask?.description || '')
  const [weight, setWeight] = useState<TaskWeight>(existingTask?.weight || 3)
  const [dueDate, setDueDate] = useState(existingTask?.due_date || '')
  const [destination, setDestination] = useState<'backlog' | 'calendar'>(
    initialScheduledDate || existingTask?.scheduled_at ? 'calendar' : 'backlog'
  )
  const [scheduledDate, setScheduledDate] = useState(
    initialScheduledDate || existingTask?.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  )
  const [scheduledTime, setScheduledTime] = useState(
    existingTask?.scheduled_at?.split('T')[1]?.slice(0, 5) || '09:00'
  )
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>(
    existingTask?.is_recurring ? 'weekly' : 'none'
  )
  const [recurrenceInterval, setRecurrenceInterval] = useState(existingTask?.recurrence?.interval || 1)
  const [recurrenceWeekDays, setRecurrenceWeekDays] = useState<number[]>(existingTask?.recurrence?.days || [])
  const [recurrenceUntil, setRecurrenceUntil] = useState(existingTask?.recurrence?.until || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return

    setIsSubmitting(true)

    const scheduledAt = destination === 'calendar' && scheduledDate
      ? `${scheduledDate}T${scheduledTime}:00`
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
      recurrence: recurrence !== 'none' ? {
        type: recurrence,
        interval: recurrenceInterval,
        days: recurrence === 'weekly' ? recurrenceWeekDays : undefined,
        until: recurrenceUntil || null,
      } : null,
      parent_id: null,
    })

    setIsSubmitting(false)
    if (!error) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <form
        className="w-full max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '28px 28px 0 0',
        }}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-4 sticky top-0 bg-inherit z-10">
          <div 
            className="w-10 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--border-default)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-6">
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {existingTask ? 'Schedula impegno' : 'Nuovo impegno'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-6">
          {/* Title Input */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Titolo *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Descrivi l'impegno..."
              required
              className="w-full px-4 py-3.5 rounded-card text-base font-medium transition-all outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Note
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Aggiungi dettagli..."
              rows={3}
              className="w-full px-4 py-3.5 rounded-card text-base resize-none transition-all outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Weight Selector */}
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Peso / Impegno
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as TaskWeight[]).map(w => {
                const color = getWeightColor(w)
                const isSelected = weight === w
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeight(w)}
                    className="flex-1 py-3 rounded-card font-bold text-base transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? color : 'var(--bg-input)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      boxShadow: isSelected ? `0 4px 12px ${color}50` : 'none',
                    }}
                  >
                    {w}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Data scadenza
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-card text-base outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Destination Toggle */}
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dove lo aggiungi?
            </label>
            <div 
              className="flex rounded-card p-1"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              {(['backlog', 'calendar'] as const).map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    backgroundColor: destination === dest ? 'var(--bg-card)' : 'transparent',
                    color: destination === dest ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    boxShadow: destination === dest ? 'var(--shadow-soft)' : 'none',
                  }}
                >
                  {dest === 'backlog' ? 'Backlog' : 'Calendario'}
                </button>
              ))}
            </div>

            {/* Calendar Fields */}
            {destination === 'calendar' && (
              <div className="mt-4 flex gap-3">
                <div className="flex-1">
                  <label 
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Data
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
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
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Ricorrenza
            </label>
            <select
              value={recurrence}
              onChange={e => {
                const value = e.target.value as typeof recurrence
                setRecurrence(value)
                if (value === 'none') {
                  setRecurrenceWeekDays([])
                  setRecurrenceInterval(1)
                  setRecurrenceUntil('')
                }
              }}
              className="w-full px-4 py-3.5 rounded-card text-base outline-none appearance-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="none">Nessuna</option>
              <option value="daily">Ogni giorno</option>
              <option value="weekly">Ogni settimana</option>
              <option value="monthly">Ogni mese</option>
              <option value="custom">Personalizzata</option>
            </select>

            {/* Weekly Days */}
            {recurrence === 'weekly' && (
              <div className="mt-4">
                <label 
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Giorni della settimana
                </label>
                <div className="flex gap-1.5">
                  {[
                    { day: 1, label: 'L' },
                    { day: 2, label: 'M' },
                    { day: 3, label: 'M' },
                    { day: 4, label: 'G' },
                    { day: 5, label: 'V' },
                    { day: 6, label: 'S' },
                    { day: 0, label: 'D' },
                  ].map(({ day, label }) => {
                    const isSelected = recurrenceWeekDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setRecurrenceWeekDays(prev =>
                            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
                          )
                        }}
                        className="flex-1 aspect-square rounded-xl font-bold text-sm transition-all duration-200"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Until Date */}
            {recurrence !== 'none' && (
              <div className="mt-4">
                <label 
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Termina il (opzionale)
                </label>
                <input
                  type="date"
                  value={recurrenceUntil}
                  onChange={e => setRecurrenceUntil(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="w-full py-4 rounded-card font-bold text-base transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}
          >
            {isSubmitting
              ? 'Salvataggio...'
              : destination === 'backlog'
                ? 'Salva nel Backlog'
                : 'Schedula'}
          </button>
        </div>
      </form>
    </div>
  )
}
