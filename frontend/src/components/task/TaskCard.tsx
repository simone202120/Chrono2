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
 * TaskCard — iOS-style task row
 * - Left accent bar (weight color)
 * - Title + description + footer meta
 * - Completed: opacity + strikethrough
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
        'w-full rounded-2xl text-left cursor-pointer select-none overflow-hidden transition-all duration-150 active:scale-[0.98]',
        isCompleted ? 'opacity-55' : ''
      )}
      style={{
        backgroundColor: 'var(--color-background-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-stretch">
        {/* Weight accent bar */}
        <div
          className="w-[3px] flex-shrink-0 rounded-l-2xl"
          style={{
            backgroundColor: isCompleted
              ? 'var(--color-text-tertiary)'
              : `var(--color-weight-${task.weight})`,
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3.5">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                'flex-1 text-[15px] font-semibold leading-snug',
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              )}
            >
              {task.title}
            </h3>
            {/* Right indicators */}
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {isCompleted && <CheckCircle2 size={15} className="text-emerald-400" />}
              {isDueSoon && !isCompleted && <AlertCircle size={15} className="text-red-400" />}
              {task.is_recurring && !isCompleted && <RefreshCw size={12} className="text-indigo-400" />}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={cn(
              'text-[13px] mt-0.5 line-clamp-1 leading-snug',
              isCompleted ? 'text-slate-400' : 'text-slate-500'
            )}>
              {task.description}
            </p>
          )}

          {/* Footer: time, due date, weight pill */}
          <div className="flex items-center gap-2.5 mt-2">
            {task.scheduled_at && (
              <div
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <Clock size={10} />
                {format(new Date(task.scheduled_at), 'HH:mm')}
              </div>
            )}
            {task.due_date && (
              <div className={cn(
                'flex items-center gap-1 text-[11px] font-medium',
                isDueSoon && !isCompleted ? 'text-red-500' : 'text-slate-400'
              )}>
                <Calendar size={10} />
                {format(new Date(task.due_date), 'd MMM', { locale: it })}
              </div>
            )}
            {/* Weight badge */}
            <div
              className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isCompleted
                  ? 'rgba(0,0,0,0.04)'
                  : `var(--color-weight-${task.weight})15`,
                color: isCompleted
                  ? 'var(--color-text-tertiary)'
                  : `var(--color-weight-${task.weight})`,
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
