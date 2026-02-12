import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '@/types/task'

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

interface TaskActions {
  fetchTasks: () => Promise<void>
  createTask: (payload: TaskCreatePayload) => Promise<{ error: Error | null }>
  updateTask: (
    id: string,
    updates: TaskUpdatePayload
  ) => Promise<{ error: Error | null }>
  deleteTask: (id: string) => Promise<{ error: Error | null }>
  completeTask: (id: string) => Promise<{ error: Error | null }>
  clearError: () => void
}

type TaskStore = TaskState & TaskActions

/**
 * Task Store - Single Source of Truth (SSOT) for tasks
 * - All Supabase queries go through this store
 * - Optimistic updates with rollback on error
 * - Error handling with user feedback
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  // State
  tasks: [],
  loading: false,
  error: null,

  // Actions
  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ tasks: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      set({
        error: 'Errore nel caricamento dei task',
        loading: false,
      })
    }
  },

  createTask: async (payload: TaskCreatePayload) => {
    const tempId = crypto.randomUUID()
    const optimisticTask: Task = {
      ...payload,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic update
    set(state => ({ tasks: [optimisticTask, ...state.tasks] }))

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single()

      if (error) throw error

      // Replace optimistic task with real one
      set(state => ({
        tasks: state.tasks.map(t => (t.id === tempId ? data : t)),
      }))

      return { error: null }
    } catch (error) {
      console.error('Error creating task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== tempId),
        error: 'Errore nella creazione del task',
      }))

      return { error: error as Error }
    }
  },

  updateTask: async (id: string, updates: TaskUpdatePayload) => {
    // Store original task for rollback
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error updating task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? originalTask : t)),
        error: 'Errore nell\'aggiornamento del task',
      }))

      return { error: error as Error }
    }
  },

  deleteTask: async (id: string) => {
    // Store original task for rollback
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    // Optimistic delete
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }))

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error deleting task:', error)

      // Rollback
      set(state => ({
        tasks: [...state.tasks, originalTask],
        error: 'Errore nell\'eliminazione del task',
      }))

      return { error: error as Error }
    }
  },

  completeTask: async (id: string) => {
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    const completedTask = {
      ...originalTask,
      status: 'done' as const,
      completed_at: new Date().toISOString(),
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? completedTask : t)),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error completing task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? originalTask : t)),
        error: 'Errore nel completamento del task',
      }))

      return { error: error as Error }
    }
  },

  clearError: () => set({ error: null }),
}))
