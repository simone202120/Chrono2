import { useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
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
  const scheduleTask = useTaskStore(state => state.scheduleTask)

  // Form state - pre-fill if editing existing task
  const [title, setTitle] = useState(existingTask?.title || '')
  const [description, setDescription] = useState(existingTask?.description || '')
  const [weight, setWeight] = useState<TaskWeight>(existingTask?.weight || 3)
  const [dueDate, setDueDate] = useState(existingTask?.due_date || '')
  const [destination, setDestination] = useState<'backlog' | 'calendar'>(
    initialScheduledDate || existingTask?.scheduled_at ? 'calendar' : 'backlog'
  )
  const [scheduledDate, setScheduledDate] = useState(
    initialScheduledDate || existingTask?.scheduled_at?.split('T')[0] || ''
  )
  const [scheduledTime, setScheduledTime] = useState(
    existingTask?.scheduled_at?.split('T')[1]?.slice(0, 5) || '09:00'
  )
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    existingTask?.is_recurring ? 'weekly' : 'none'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return

    setIsSubmitting(true)

    const scheduledAt =
      destination === 'calendar' && scheduledDate
        ? `${scheduledDate}T${scheduledTime}:00`
        : null

    let error = null

    if (existingTask) {
      // Scheduling existing task
      if (destination === 'calendar' && scheduledAt) {
        error = await scheduleTask(existingTask.id, scheduledAt)
      }
    } else {
      // Creating new task
      const result = await createTask({
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
            ? { type: recurrence, interval: 1 }
            : null,
        parent_id: null,
      })
      error = result.error
    }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <form
        className="w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-background-card)' }}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-separator)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {existingTask ? 'Schedula impegno' : 'Nuovo impegno'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Titolo *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Descrivi l'impegno..."
              required
              className="w-full px-4 py-3 rounded-xl border text-base"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-separator)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Aggiungi dettagli..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-base resize-none"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-separator)',
              }}
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Peso / Impegno
            </label>
            <div className="flex gap-2 justify-between">
              {([1, 2, 3, 4, 5] as TaskWeight[]).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className="flex-1 py-2 px-3 rounded-full font-semibold text-sm transition-all"
                  style={{
                    backgroundColor:
                      weight === w
                        ? weightColors[w]
                        : 'var(--color-background-section)',
                    color: weight === w ? 'white' : 'var(--color-text-primary)',
                    border:
                      weight === w ? 'none' : '1px solid var(--color-separator)',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Lieve
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Critico
              </span>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Data scadenza
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-separator)',
              }}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Dove lo aggiungi?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="radio"
                  name="destination"
                  value="backlog"
                  checked={destination === 'backlog'}
                  onChange={e => setDestination(e.target.value as 'backlog')}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Backlog (decido dopo)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="radio"
                  name="destination"
                  value="calendar"
                  checked={destination === 'calendar'}
                  onChange={e => setDestination(e.target.value as 'calendar')}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Calendario</span>
              </label>
            </div>

            {destination === 'calendar' && (
              <div className="mt-3 flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
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
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{
                      backgroundColor: 'var(--color-background-card)',
                      borderColor: 'var(--color-separator)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ricorrenza
            </label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as typeof recurrence)}
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-separator)',
              }}
            >
              <option value="none">Nessuna</option>
              <option value="daily">Ogni giorno</option>
              <option value="weekly">Ogni settimana</option>
              <option value="monthly">Ogni mese</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="w-full py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
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
