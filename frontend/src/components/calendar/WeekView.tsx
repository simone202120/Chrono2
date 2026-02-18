import { useMemo } from 'react'
import { format, startOfDay } from 'date-fns'
import { DayColumn } from './DayColumn'
import type { Task } from '@/types/task'

interface WeekViewProps {
  weekDates: Date[]
  tasks: Task[]
  onDayPress: (date: Date) => void
}

/**
 * WeekView - Week grid component
 * - 7 columns (Monday to Sunday)
 * - Each column shows day name, date, and task dots
 * - Today is highlighted with blue circle
 * - Tap on day navigates to DayPage
 */
export function WeekView({ weekDates, tasks, onDayPress }: WeekViewProps) {
  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>()

    tasks.forEach(task => {
      if (!task.scheduled_at) return

      const dateKey = format(startOfDay(new Date(task.scheduled_at)), 'yyyy-MM-dd')
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(task)
    })

    return grouped
  }, [tasks])

  return (
    <div className="p-3" style={{ backgroundColor: 'var(--color-background-card)' }}>
      <div className="flex gap-1">
        {weekDates.map(date => {
          const dateKey = format(startOfDay(date), 'yyyy-MM-dd')
          const dayTasks = tasksByDate.get(dateKey) || []

          return (
            <DayColumn
              key={dateKey}
              date={date}
              tasks={dayTasks}
              onPress={onDayPress}
            />
          )
        })}
      </div>
    </div>
  )
}
