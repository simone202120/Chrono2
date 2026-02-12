import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { WeightBadge } from './WeightBadge'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

/**
 * TaskCard - Base task card component
 * - Shows task title, weight, date/time, status
 * - Visual indicators: due soon (⚠️), recurring (🔁)
 * - iOS-styled card with tap interaction
 * - Completed state: grayed out + strikethrough
 */
export function TaskCard({ task, onClick }: TaskCardProps) {
  const isCompleted = task.status === 'done'
  const isDueSoon =
    task.due_date &&
    new Date(task.due_date).getTime() - Date.now() < 48 * 60 * 60 * 1000

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-all active:scale-[0.97]',
        isCompleted && 'opacity-50'
      )}
      style={{
        backgroundColor: 'var(--color-background-card)',
        border: '1px solid var(--color-separator)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Weight Badge */}
        <WeightBadge weight={task.weight} size="sm" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={cn(
              'text-base font-medium mb-1',
              isCompleted && 'line-through'
            )}
          >
            {task.title}
          </h3>

          {/* Metadata */}
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {/* Scheduled time */}
            {task.scheduled_at && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {format(new Date(task.scheduled_at), 'HH:mm')}
              </span>
            )}

            {/* Due date */}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(task.due_date), 'd MMM', { locale: it })}
              </span>
            )}

            {/* Completed */}
            {isCompleted && task.completed_at && (
              <span>
                Completato {format(new Date(task.completed_at), 'd MMM')}
              </span>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          {/* Due soon warning */}
          {isDueSoon && !isCompleted && (
            <AlertCircle size={16} style={{ color: 'var(--color-destructive)' }} />
          )}

          {/* Recurring indicator */}
          {task.is_recurring && (
            <RefreshCw size={16} style={{ color: 'var(--color-primary)' }} />
          )}
        </div>
      </div>
    </button>
  )
}
