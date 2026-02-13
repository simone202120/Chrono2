import { create } from 'zustand'
import { toast } from 'sonner'
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
  moveToBacklog: (id: string) => Promise<{ error: Error | null }>
  postponeTask: (id: string, newDate: string) => Promise<{ error: Error | null }>
  scheduleTask: (id: string, scheduledAt: string) => Promise<{ error: Error | null }>
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

      toast.success('Impegno aggiunto ✓')
      return { error: null }
    } catch (error) {
      console.error('Error creating task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== tempId),
        error: 'Errore nella creazione del task',
      }))

      toast.error('Errore nella creazione. Riprova.', {
        action: {
          label: 'Riprova',
          onClick: () => {}
        }
      })
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

      toast.success('Impegno eliminato')
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

      toast.success('Completato ✓')
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

  moveToBacklog: async (id: string) => {
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    const backlogTask = {
      ...originalTask,
      status: 'backlog' as const,
      scheduled_at: null,
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? backlogTask : t)),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'backlog',
          scheduled_at: null,
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Spostato nel backlog')
      return { error: null }
    } catch (error) {
      console.error('Error moving task to backlog:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? originalTask : t)),
        error: 'Errore nello spostamento nel backlog',
      }))

      return { error: error as Error }
    }
  },

  postponeTask: async (id: string, newDate: string) => {
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    const postponedTask = {
      ...originalTask,
      scheduled_at: newDate,
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? postponedTask : t)),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          scheduled_at: newDate,
        })
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error postponing task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? originalTask : t)),
        error: 'Errore nel rinvio del task',
      }))

      return { error: error as Error }
    }
  },

  scheduleTask: async (id: string, scheduledAt: string) => {
    const originalTask = get().tasks.find(t => t.id === id)
    if (!originalTask) {
      return { error: new Error('Task non trovato') }
    }

    const scheduledTask = {
      ...originalTask,
      status: 'scheduled' as const,
      scheduled_at: scheduledAt,
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? scheduledTask : t)),
    }))

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt,
        })
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error scheduling task:', error)

      // Rollback
      set(state => ({
        tasks: state.tasks.map(t => (t.id === id ? originalTask : t)),
        error: 'Errore nella schedulazione del task',
      }))

      return { error: error as Error }
    }
  },

  completeRecurringInstance: async (
    parentId: string,
    instanceDate: string,
    completeFuture: boolean
  ) => {
    const parentTask = get().tasks.find(t => t.id === parentId)
    if (!parentTask) {
      return { error: new Error('Task ricorrente non trovato') }
    }

    if (completeFuture) {
      // Complete all future instances by updating 'until' date
      const yesterday = new Date(instanceDate)
      yesterday.setDate(yesterday.getDate() - 1)
      const untilDate = yesterday.toISOString().split('T')[0]

      const updatedRecurrence = {
        ...parentTask.recurrence!,
        until: untilDate,
      }

      // Optimistic update
      const originalRecurrence = parentTask.recurrence
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === parentId
            ? { ...t, recurrence: updatedRecurrence, updated_at: new Date().toISOString() }
            : t
        ),
      }))

      try {
        const { error } = await supabase
          .from('tasks')
          .update({ recurrence: updatedRecurrence })
          .eq('id', parentId)

        if (error) throw error

        return { error: null }
      } catch (error) {
        console.error('Error updating recurrence:', error)

        // Rollback
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === parentId ? { ...t, recurrence: originalRecurrence } : t
          ),
          error: 'Errore nell\'aggiornamento della ricorrenza',
        }))

        return { error: error as Error }
      }
    } else {
      // Complete only this instance by creating a completed task instance
      const instancePayload: TaskCreatePayload = {
        user_id: parentTask.user_id,
        title: parentTask.title,
        description: parentTask.description,
        weight: parentTask.weight,
        due_date: parentTask.due_date,
        scheduled_at: instanceDate,
        completed_at: new Date().toISOString(),
        status: 'done',
        is_recurring: false,
        recurrence: null,
        parent_id: parentId,
      }

      const tempId = crypto.randomUUID()
      const optimisticTask: Task = {
        ...instancePayload,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Optimistic update
      set(state => ({ tasks: [optimisticTask, ...state.tasks] }))

      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([instancePayload])
          .select()
          .single()

        if (error) throw error

        // Replace optimistic task with real one
        set(state => ({
          tasks: state.tasks.map(t => (t.id === tempId ? data : t)),
        }))

        return { error: null }
      } catch (error) {
        console.error('Error creating completed instance:', error)

        // Rollback
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== tempId),
          error: 'Errore nel completamento dell\'istanza',
        }))

        return { error: error as Error }
      }
    }
  },

  clearError: () => set({ error: null }),
}))
