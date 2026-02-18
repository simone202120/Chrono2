import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, RefreshCw, GripVertical } from 'lucide-react'
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
 * - Tap anywhere on card → opens detail (touchAction libero per scroll)
 * - Grip handle (destra) → long press to drag to calendar
 * - UX fix: drag handle separato dalla tap area
 */
export function BacklogItem({ task, onTap }: BacklogItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  // Traccia se il drag è appena iniziato per evitare tap accidentali
  const didDragRef = useRef(false)

  const style = { transform: CSS.Translate.toString(transform) }

  const isDueSoon = task.due_date &&
    differenceInDays(new Date(task.due_date), new Date()) <= 7 &&
    differenceInDays(new Date(task.due_date), new Date()) >= 0

  const handleCardClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (!isDragging) onTap(task)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={cn(
        'w-full rounded-2xl border bg-white text-left select-none overflow-hidden transition-all duration-150',
        isDragging
          ? 'opacity-40 scale-95 shadow-2xl rotate-1'
          : 'border-slate-100 shadow-sm active:scale-[0.98] active:shadow-none',
      )}
    >
      <div className="flex items-stretch">
        {/* Weight color bar */}
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{ backgroundColor: `var(--color-weight-${task.weight})` }}
        />

        {/* Card content — tap area, nessun listener DnD qui */}
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

        {/* Drag handle — unica area con listener DnD e touchAction:none */}
        <div
          {...listeners}
          {...attributes}
          onPointerDown={() => { didDragRef.current = true }}
          onClick={e => e.stopPropagation()}
          className="flex items-center justify-center w-10 self-stretch flex-shrink-0 border-l border-slate-50"
          style={{
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'var(--color-text-placeholder)',
          }}
          aria-label="Trascina nel calendario"
          title="Tieni premuto e trascina nel giorno desiderato"
        >
          <GripVertical size={16} />
        </div>
      </div>
    </div>
  )
}
