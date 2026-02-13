import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { WeightBadge } from '@/components/task/WeightBadge'

interface BacklogItemProps {
  task: Task
  onTap: (task: Task) => void
}

/**
 * BacklogItem - Draggable task item for backlog
 * - Shows task title, description, and weight badge
 * - Long press (150ms) to drag
 * - Tap to open detail
 * - Visual feedback during drag (cursor: grab)
 */
export function BacklogItem({ task, onTap }: BacklogItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(task)}
      className="rounded-xl p-3 active:scale-[0.98] transition-transform touch-none"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap(task)
        }
      }}
      style={{
        ...style,
        backgroundColor: 'var(--color-background-card)',
        border: '1px solid var(--color-separator)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-sm mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className="text-xs line-clamp-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {task.description}
            </p>
          )}
        </div>
        <WeightBadge weight={task.weight} />
      </div>
    </div>
  )
}
