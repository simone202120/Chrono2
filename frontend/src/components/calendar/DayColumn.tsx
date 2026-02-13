import { format, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale'
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
 * DayColumn - Single day column in week view
 * - Shows day name and date number
 * - Highlights today with blue circle
 * - Shows up to 3 task dots (colored by weight)
 * - Shows "+N" if more than 3 tasks
 * - Tap to navigate to day view
 */
export function DayColumn({ date, tasks, onPress }: DayColumnProps) {
  const isToday = isSameDay(date, new Date())
  const dayName = format(date, 'EEEEEE', { locale: it }) // Lu, Ma, etc.
  const dayNumber = format(date, 'd')

  const visibleTasks = tasks.slice(0, 3)
  const hiddenCount = Math.max(0, tasks.length - 3)

  return (
    <button
      onClick={() => onPress(date)}
      className="flex-1 flex flex-col items-center py-3 px-1 min-w-0"
      style={{ minWidth: '40px' }}
    >
      {/* Day name */}
      <div
        className="text-xs font-medium mb-1 uppercase"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {dayName}
      </div>

      {/* Day number */}
      <div
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mb-2 transition-colors',
          isToday && 'text-white'
        )}
        style={{
          backgroundColor: isToday ? 'var(--color-primary)' : 'transparent',
          color: isToday ? 'white' : 'var(--color-text-primary)',
        }}
      >
        {dayNumber}
      </div>

      {/* Task dots */}
      <div className="flex flex-col items-center gap-1 min-h-[40px]">
        {visibleTasks.map((task, idx) => (
          <div
            key={task.id || idx}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: WEIGHT_COLORS[task.weight] }}
            title={task.title}
          />
        ))}
        {hiddenCount > 0 && (
          <span
            className="text-xs font-medium mt-0.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            +{hiddenCount}
          </span>
        )}
      </div>
    </button>
  )
}
