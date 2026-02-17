import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

/**
 * TaskCard - Scheduled task card
 * - Weight color bar on left edge
 * - Title, description, metadata
 * - Due-soon warning, recurring indicator
 * - Completed state: muted with strikethrough + check icon
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
        'w-full rounded-2xl border text-left cursor-pointer select-none overflow-hidden transition-all duration-150 active:scale-[0.98]',
        isCompleted
          ? 'bg-slate-50 border-slate-100 opacity-70'
          : 'bg-white border-slate-100 shadow-sm active:shadow-none'
      )}
    >
      <div className="flex items-stretch">
        {/* Weight color bar */}
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{
            backgroundColor: isCompleted ? 'var(--color-text-tertiary)' : `var(--color-weight-${task.weight})`,
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'text-[15px] font-semibold leading-snug',
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              )}
            >
              {task.title}
            </h3>

            {/* Right-side indicators */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {isCompleted && (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
              {isDueSoon && !isCompleted && (
                <AlertCircle size={16} className="text-red-500" />
              )}
              {task.is_recurring && !isCompleted && (
                <RefreshCw size={13} className="text-indigo-400" />
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={cn(
              'text-sm mt-1 line-clamp-1',
              isCompleted ? 'text-slate-400' : 'text-slate-500'
            )}>
              {task.description}
            </p>
          )}

          {/* Footer: time + due date */}
          <div className="flex items-center gap-3 mt-2.5">
            {task.scheduled_at && (
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <Clock size={12} />
                <span>{format(new Date(task.scheduled_at), 'HH:mm')}</span>
              </div>
            )}
            {task.due_date && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isDueSoon && !isCompleted ? 'text-red-500' : 'text-slate-400'
              )}>
                <Calendar size={12} />
                <span>{format(new Date(task.due_date), 'd MMM', { locale: it })}</span>
              </div>
            )}
            {/* Weight pill */}
            <div
              className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isCompleted ? 'var(--color-background-section)' : `var(--color-weight-${task.weight})20`,
                color: isCompleted ? 'var(--color-text-tertiary)' : `var(--color-weight-${task.weight})`,
              }}
            >
              P{task.weight}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
