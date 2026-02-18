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
 * DayColumn — iOS Calendar-style day cell (droppable)
 * - Abbreviazione giorno + cerchio data (oggi = filled)
 * - Colored task bars (fino a 3) + "+N" extra
 * - Highlight when drag-over
 */
export function DayColumn({ date, tasks, onPress }: DayColumnProps) {
  const dateString = format(startOfDay(date), 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dateString })

  const isToday = isSameDay(date, new Date())
  const dayName = format(date, 'EEEEEE', { locale: it }).toUpperCase()
  const dayNumber = format(date, 'd')

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const visibleTasks = activeTasks.slice(0, 3)
  const hiddenCount = Math.max(0, activeTasks.length - 3)

  return (
    <button
      ref={setNodeRef}
      onClick={() => onPress(date)}
      className={cn(
        'flex-1 flex flex-col items-center py-3 px-0.5 min-w-0 rounded-xl transition-all duration-200 active:scale-95',
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-inset' : 'active:bg-black/5'
      )}
    >
      {/* Abbreviazione giorno */}
      <span
        className="text-[10px] font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}
      >
        {dayName}
      </span>

      {/* Cerchio data — iOS Calendar style */}
      <div
        className="w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-bold mb-2"
        style={{
          background: isToday
            ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
            : 'transparent',
          color: isToday ? '#ffffff' : 'var(--color-text-primary)',
        }}
      >
        {dayNumber}
      </div>

      {/* Barre task colorate */}
      <div className="w-full flex flex-col items-center gap-1 min-h-[28px] justify-start px-1">
        {visibleTasks.map((task, idx) => (
          <div
            key={task.id || idx}
            className="w-full h-[3px] rounded-full opacity-85"
            style={{ backgroundColor: WEIGHT_COLORS[task.weight] }}
            title={task.title}
          />
        ))}
        {hiddenCount > 0 && (
          <span className="text-[9px] font-bold" style={{ color: 'var(--color-text-tertiary)' }}>
            +{hiddenCount}
          </span>
        )}
        {activeTasks.length === 0 && (
          <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: 'var(--color-separator)' }} />
        )}
      </div>
    </button>
  )
}
