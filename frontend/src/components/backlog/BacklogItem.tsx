import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface BacklogItemProps {
  task: Task
  onTap: (task: Task) => void
}

/**
 * BacklogItem - Draggable task item for backlog
 * - Shows task title, description, and weight indicator
 * - Long press (150ms) to drag
 * - Tap to open detail
 * - Visual feedback during drag (cursor: grab)
 */
export function BacklogItem({ task, onTap }: BacklogItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(task)}
      className={cn(
        "modern-card p-3 flex items-start gap-3 cursor-grab active:cursor-grabbing touch-none select-none bg-white",
        isDragging && "opacity-50 scale-95 shadow-xl rotate-2 z-50"
      )}
      style={style}
    >
      {/* Weight Indicator */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: `var(--color-weight-${task.weight})` }}
      />

      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-medium text-sm text-slate-900 leading-tight">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>
    </div>
  )
}
