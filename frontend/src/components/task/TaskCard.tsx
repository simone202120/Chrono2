import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'
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
    <div
      onClick={onClick}
      className={cn(
        'modern-card w-full p-4 text-left cursor-pointer select-none',
        isCompleted ? 'opacity-60 bg-gray-50' : 'bg-white'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Weight Indicator (Left Border) */}
        <div
          className="w-1.5 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: `var(--color-weight-${task.weight})` }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'text-base font-semibold leading-tight text-gray-900',
                isCompleted && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </h3>
            
            {/* Status Icons */}
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              {isDueSoon && !isCompleted && (
                <AlertCircle size={16} className="text-red-500" />
              )}
              {task.is_recurring && (
                <RefreshCw size={14} className="text-blue-500" />
              )}
            </div>
          </div>

          {/* Description (if any) */}
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
            {/* Time */}
            {task.scheduled_at && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock size={14} />
                <span>{format(new Date(task.scheduled_at), 'HH:mm')}</span>
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1.5",
                isDueSoon ? "text-red-500" : "text-gray-500"
              )}>
                <Calendar size={14} />
                <span>{format(new Date(task.due_date), 'd MMM', { locale: it })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
