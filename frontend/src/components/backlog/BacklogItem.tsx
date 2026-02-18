import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { cn, getWeightColor } from '@/lib/utils'

interface BacklogItemProps {
  task: Task
  onTap: (task: Task) => void
}

/**
 * BacklogItem - Revolut Modern Style
 * - Draggable task item
 * - Weight pill top-right
 * - Clean minimal design
 */
export function BacklogItem({ task, onTap }: BacklogItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const weightColor = getWeightColor(task.weight)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(task)}
      className={cn(
        "relative p-4 rounded-card cursor-grab active:cursor-grabbing touch-none select-none transition-all duration-200",
        isDragging && "opacity-50 scale-95 shadow-xl rotate-2 z-50"
      )}
      style={{
        ...style,
        backgroundColor: 'var(--bg-card)',
        border: `1px solid var(--border-subtle)`,
        boxShadow: isDragging ? `0 8px 32px ${weightColor}40` : 'var(--shadow-soft)',
      }}
    >
      {/* Weight Badge - Top Right */}
      <div 
        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: weightColor + '15' }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full"
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
      <div className="pr-10">
        <h3 
          className="font-semibold text-sm leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </h3>
        {task.description && (
          <p 
            className="text-xs mt-1 line-clamp-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {task.description}
          </p>
        )}
      </div>
    </div>
  )
}
