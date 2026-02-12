/**
 * Task status (matches DB enum task_status)
 * - backlog: Not scheduled yet, in backlog
 * - scheduled: Scheduled for a specific date/time
 * - done: Task completed
 * - postponed: Postponed to later
 */
export type TaskStatus = 'backlog' | 'scheduled' | 'done' | 'postponed'

/**
 * Task weight (1-5 scale)
 * Represents the effort/complexity required
 */
export type TaskWeight = 1 | 2 | 3 | 4 | 5

/**
 * Recurrence type (matches DB enum recurrence_type)
 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom'

/**
 * Recurrence configuration (stored as JSONB in DB)
 * Example: { "type": "weekly", "days": [1, 3, 5], "until": "2025-12-31", "interval": 1 }
 */
export interface RecurrenceConfig {
  type: RecurrenceType
  interval: number // e.g., every 2 weeks
  days?: number[] // for weekly: 0 = Sunday, 6 = Saturday
  dayOfMonth?: number // for monthly: 1-31
  until?: string | null // ISO date string
}

/**
 * Main Task interface
 * Matches Supabase 'tasks' table schema exactly
 */
export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  weight: TaskWeight
  due_date: string | null // ISO date string
  scheduled_at: string | null // ISO datetime string
  completed_at: string | null // ISO datetime string
  status: TaskStatus
  is_recurring: boolean
  recurrence: RecurrenceConfig | null
  parent_id: string | null // for recurring task instances
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
