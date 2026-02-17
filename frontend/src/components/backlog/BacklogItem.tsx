import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, RefreshCw } from 'lucide-react'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface BacklogItemProps {
  task: Task
  onTap: (task: Task) => void
}

/**
 * BacklogItem - Draggable task item for backlog
 * - Weight color bar + weight pill
 * - Title, description, due date, recurring indicator
 * - Long press to drag to calendar
 * - Tap to open detail
 */
export function BacklogItem({ task, onTap }: BacklogItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = { transform: CSS.Translate.toString(transform) }

  const isDueSoon = task.due_date &&
    differenceInDays(new Date(task.due_date), new Date()) <= 7 &&
    differenceInDays(new Date(task.due_date), new Date()) >= 0

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(task)}
      className={cn(
        'w-full rounded-2xl border bg-white text-left select-none overflow-hidden transition-all duration-150',
        isDragging
          ? 'opacity-40 scale-95 shadow-2xl rotate-1'
          : 'border-slate-100 shadow-sm active:scale-[0.98] active:shadow-none',
      )}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      <div className="flex items-stretch">
        {/* Weight color bar */}
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{ backgroundColor: `var(--color-weight-${task.weight})` }}
        />

        <div className="flex-1 min-w-0 px-3.5 py-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>

            {/* Weight pill */}
            <div
              className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
              style={{
                backgroundColor: `var(--color-weight-${task.weight})20`,
                color: `var(--color-weight-${task.weight})`,
              }}
            >
              P{task.weight}
            </div>
          </div>

          {/* Footer metadata */}
          {(task.due_date || task.is_recurring) && (
            <div className="flex items-center gap-3 mt-2">
              {task.due_date && (
                <div className={cn(
                  'flex items-center gap-1 text-[10px] font-semibold',
                  isDueSoon ? 'text-red-500' : 'text-slate-400'
                )}>
                  <Calendar size={10} />
                  {format(new Date(task.due_date), 'd MMM', { locale: it })}
                </div>
              )}
              {task.is_recurring && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400">
                  <RefreshCw size={10} />
                  Ricorrente
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
