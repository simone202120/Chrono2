import { format, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import type { Task } from '@/types/task'
import { cn, getWeightColor } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

/**
 * TaskCard - Revolut Modern Style
 * - Rounded card with colored shadow based on weight
 * - Weight pill in top-right corner
 * - Clean minimal design
 * - Dark mode support
 */
export function TaskCard({ task, onClick }: TaskCardProps) {
  const isCompleted = task.status === 'done'
  const weightColor = getWeightColor(task.weight)
  
  // Check if due soon (within 48 hours)
  const isDueSoon = task.due_date && differenceInDays(new Date(task.due_date), new Date()) <= 2
  
  // Calculate days until due
  const daysUntilDue = task.due_date ? differenceInDays(new Date(task.due_date), new Date()) : null

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full p-4 rounded-card cursor-pointer select-none transition-all duration-200',
        isCompleted ? 'opacity-50' : ''
      )}
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: isCompleted ? 'var(--shadow-soft)' : `0 4px 20px ${weightColor}20`,
        border: `1px solid ${isCompleted ? 'var(--border-subtle)' : weightColor + '30'}`,
      }}
    >
      {/* Weight Badge - Top Right */}
      <div 
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-badge"
        style={{ backgroundColor: weightColor + '15' }}
      >
        <span 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: weightColor }}
        />
        <span 
          className="text-xs font-bold"
          style={{ color: weightColor }}
        >
          {task.weight}
        </span>
      </div>

      {/* Content */}
      <div className="pr-12">
        {/* Title */}
        <h3
          className="text-base font-semibold leading-snug"
          style={{ 
            color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </h3>
        
        {/* Description */}
        {task.description && (
          <p 
            className="text-sm mt-1.5 line-clamp-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {task.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-4 mt-3">
          {/* Scheduled Time */}
          {task.scheduled_at && (
            <div 
              className="flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Clock size={14} />
              <span className="text-sm font-medium">
                {format(new Date(task.scheduled_at), 'HH:mm')}
              </span>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div 
              className="flex items-center gap-1.5"
              style={{ 
                color: isDueSoon ? 'var(--color-destructive)' : 'var(--text-secondary)',
              }}
            >
              <Calendar size={14} />
              <span className="text-sm font-medium">
                {format(new Date(task.due_date), 'd MMM', { locale: it })}
                {daysUntilDue !== null && daysUntilDue <= 0 && (
                  <span className="ml-1 text-xs">(oggi)</span>
                )}
              </span>
              {isDueSoon && !isCompleted && (
                <AlertCircle size={14} className="ml-0.5" />
              )}
            </div>
          )}

          {/* Recurring Indicator */}
          {task.is_recurring && (
            <div 
              className="flex items-center gap-1"
              style={{ color: 'var(--accent-primary)' }}
            >
              <RefreshCw size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
