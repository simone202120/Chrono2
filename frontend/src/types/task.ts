/**
 * Task status
 * - pending: Not completed yet
 * - completed: Task is done
 */
export type TaskStatus = 'pending' | 'completed'

/**
 * Task weight (1-5 scale)
 * Represents the effort/complexity required
 */
export type TaskWeight = 1 | 2 | 3 | 4 | 5

/**
 * Recurrence configuration
 */
export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number // e.g., every 2 weeks
  daysOfWeek?: number[] // 0 = Sunday, 6 = Saturday (for weekly)
  dayOfMonth?: number // 1-31 (for monthly)
  endDate?: string | null // ISO date string
}

/**
 * Main Task interface
 * Matches Supabase 'tasks' table schema
 */
export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  weight: TaskWeight
  status: TaskStatus
  scheduled_at: string | null // ISO datetime string
  due_date: string | null // ISO date string
  completed_at: string | null // ISO datetime string
  is_recurring: boolean
  recurrence_config: RecurrenceConfig | null
  created_at: string // ISO datetime string
  updated_at: string // ISO datetime string
}

/**
 * Task creation payload (without server-generated fields)
 */
export type TaskCreatePayload = Omit<Task, 'id' | 'created_at' | 'updated_at'>

/**
 * Task update payload (partial, without server-generated fields)
 */
export type TaskUpdatePayload = Partial<
  Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>
