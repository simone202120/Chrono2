import { format, isSameDay, startOfDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { useDroppable } from '@dnd-kit/core'
import type { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface DayColumnProps {
  date: Date
  tasks: Task[]
  onPress: (date: Date) => void
}

const WEIGHT_COLORS: Record<number, string> = {
  1: 'var(--color-weight-1)',
  2: 'var(--color-weight-2)',
  3: 'var(--color-weight-3)',
  4: 'var(--color-weight-4)',
  5: 'var(--color-weight-5)',
}

/**
 * DayColumn - Single day in the week view (droppable)
 * - Day name + date number (today = blue pill)
 * - Task weight dots (up to 3)
 * - Total weight mini badge
 * - Highlights on drag over
 */
export function DayColumn({ date, tasks, onPress }: DayColumnProps) {
  const dateString = format(startOfDay(date), 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dateString })

  const isToday = isSameDay(date, new Date())
  const dayName = format(date, 'EEEEEE', { locale: it })
  const dayNumber = format(date, 'd')

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const visibleTasks = activeTasks.slice(0, 3)
  const hiddenCount = Math.max(0, activeTasks.length - 3)
  const totalWeight = activeTasks.reduce((sum, t) => sum + t.weight, 0)
  const hasHeavyLoad = totalWeight >= 10

  return (
    <button
      ref={setNodeRef}
      onClick={() => onPress(date)}
      className={cn(
        'flex-1 flex flex-col items-center py-3 px-0.5 min-w-0 rounded-2xl transition-all duration-200 active:scale-95',
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-offset-1' : 'hover:bg-slate-50'
      )}
      style={{ minWidth: '36px' }}
    >
      {/* Day name */}
      <div
        className="text-[10px] font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}
      >
        {dayName}
      </div>

      {/* Date number */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mb-2 transition-all"
        style={{
          backgroundColor: isToday ? 'var(--color-primary)' : 'transparent',
          color: isToday ? 'white' : hasHeavyLoad ? 'var(--color-destructive)' : 'var(--color-text-primary)',
        }}
      >
        {dayNumber}
      </div>

      {/* Task dots */}
      <div className="flex flex-col items-center gap-1 min-h-[36px] justify-start">
        {visibleTasks.map((task, idx) => (
          <div
            key={task.id || idx}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: WEIGHT_COLORS[task.weight] }}
            title={task.title}
          />
        ))}
        {hiddenCount > 0 && (
          <span
            className="text-[9px] font-bold mt-0.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            +{hiddenCount}
          </span>
        )}
      </div>

      {/* Total weight badge */}
      {activeTasks.length > 0 && (
        <div
          className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: isToday ? 'var(--color-primary-light)' : 'var(--color-background-section)',
            color: isToday ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
          }}
        >
          {totalWeight}
        </div>
      )}
    </button>
  )
}
