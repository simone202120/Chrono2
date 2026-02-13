import type { Task, RecurrenceConfig } from '@/types/task'

/**
 * Generates occurrence dates for a recurring task
 * @param task - The recurring task
 * @param from - Start date for generation
 * @param to - End date for generation
 * @returns Array of occurrence dates
 */
export function generateOccurrences(
  task: Task,
  from: Date,
  to: Date
): Date[] {
  if (!task.is_recurring || !task.recurrence || !task.scheduled_at) {
    return []
  }

  const { type, interval, days, until } = task.recurrence
  const startDate = new Date(task.scheduled_at)
  const endDate = until ? new Date(until) : to
  const occurrences: Date[] = []

  // Limit to 90 days in the future
  const maxDate = new Date(from)
  maxDate.setDate(maxDate.getDate() + 90)
  const limitDate = endDate < maxDate ? endDate : maxDate

  let currentDate = new Date(startDate)

  // Ensure we start from 'from' date if startDate is before it
  if (currentDate < from) {
    currentDate = new Date(from)
  }

  let iterations = 0
  const maxIterations = 1000 // Safety limit

  while (currentDate <= limitDate && iterations < maxIterations) {
    iterations++

    switch (type) {
      case 'daily':
        if (currentDate >= from && currentDate <= to) {
          occurrences.push(new Date(currentDate))
        }
        currentDate.setDate(currentDate.getDate() + interval)
        break

      case 'weekly':
        // For weekly recurrence, check if current day is in the selected days
        if (days && days.length > 0) {
          const currentDay = currentDate.getDay()
          if (days.includes(currentDay)) {
            if (currentDate >= from && currentDate <= to) {
              occurrences.push(new Date(currentDate))
            }
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1)

          // If we've completed a week cycle, jump to next week based on interval
          if (currentDay === 6) {
            // Sunday
            currentDate.setDate(
              currentDate.getDate() + 7 * (interval - 1)
            )
          }
        } else {
          // If no days specified, use the day of the start date
          if (currentDate >= from && currentDate <= to) {
            occurrences.push(new Date(currentDate))
          }
          currentDate.setDate(currentDate.getDate() + 7 * interval)
        }
        break

      case 'monthly':
        if (currentDate >= from && currentDate <= to) {
          occurrences.push(new Date(currentDate))
        }
        currentDate.setMonth(currentDate.getMonth() + interval)
        break

      case 'custom':
        // Custom uses interval as days
        if (currentDate >= from && currentDate <= to) {
          occurrences.push(new Date(currentDate))
        }
        currentDate.setDate(currentDate.getDate() + interval)
        break

      default:
        return occurrences
    }
  }

  return occurrences
}

/**
 * Gets the next occurrence date for a recurring task
 * @param task - The recurring task
 * @returns Next occurrence date or null
 */
export function getNextOccurrence(task: Task): Date | null {
  if (!task.is_recurring || !task.recurrence) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + 90)

  const occurrences = generateOccurrences(task, today, futureDate)
  return occurrences.length > 0 ? occurrences[0] : null
}

/**
 * Checks if a date matches the recurrence pattern
 * @param date - The date to check
 * @param recurrence - The recurrence configuration
 * @returns True if date matches the pattern
 */
export function matchesRecurrencePattern(
  date: Date,
  recurrence: RecurrenceConfig
): boolean {
  const { type, days } = recurrence

  switch (type) {
    case 'daily':
      return true

    case 'weekly':
      if (days && days.length > 0) {
        return days.includes(date.getDay())
      }
      return true

    case 'monthly':
      // Matches if same day of month
      return true

    case 'custom':
      return true

    default:
      return false
  }
}

/**
 * Formats recurrence configuration to human-readable string
 * @param recurrence - The recurrence configuration
 * @returns Human-readable string (Italian)
 */
export function formatRecurrence(recurrence: RecurrenceConfig | null): string {
  if (!recurrence) return 'Nessuna'

  const { type, interval, days, until } = recurrence

  let result = ''

  switch (type) {
    case 'daily':
      result = interval === 1 ? 'Ogni giorno' : `Ogni ${interval} giorni`
      break

    case 'weekly':
      if (interval === 1) {
        if (days && days.length > 0) {
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
          const selectedDays = days.map(d => dayNames[d]).join(', ')
          result = `Ogni settimana: ${selectedDays}`
        } else {
          result = 'Ogni settimana'
        }
      } else {
        result = `Ogni ${interval} settimane`
      }
      break

    case 'monthly':
      result = interval === 1 ? 'Ogni mese' : `Ogni ${interval} mesi`
      break

    case 'custom':
      result = `Ogni ${interval} giorni`
      break

    default:
      result = 'Sconosciuta'
  }

  if (until) {
    const untilDate = new Date(until)
    result += ` fino al ${untilDate.toLocaleDateString('it-IT')}`
  }

  return result
}

/**
 * Creates recurrence instances for a task
 * @param task - The parent recurring task
 * @param occurrences - Array of occurrence dates
 * @returns Array of task instances
 */
export function createRecurrenceInstances(
  task: Task,
  occurrences: Date[]
): Partial<Task>[] {
  return occurrences.map(date => ({
    ...task,
    id: undefined, // Will be generated by database
    parent_id: task.id,
    scheduled_at: date.toISOString(),
    is_recurring: false, // Instances are not recurring themselves
    recurrence: null,
    created_at: undefined,
    updated_at: undefined,
  }))
}
