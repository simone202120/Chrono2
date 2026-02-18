import { useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { BottomNav } from './BottomNav'
import type { Task } from '@/types/task'

interface AppShellProps {
  children: ReactNode
  title?: ReactNode
  headerAction?: ReactNode
  headerLeftAction?: ReactNode
  onTaskDrop?: (task: Task, dateString: string) => void
}

/**
 * AppShell - Modern Layout
 * - Minimalist Header
 * - Floating Bottom Nav Integration
 * - Drag & Drop Context
 */
export function AppShell({
  children,
  title,
  headerAction,
  headerLeftAction,
  onTaskDrop,
}: AppShellProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.data.current?.task) {
      const task = active.data.current.task as Task
      const dateString = over.id as string

      if (onTaskDrop) {
        onTaskDrop(task, dateString)
      }

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }

    setActiveTask(null)
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Header - Glassmorphic if desired, but let's keep it clean */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-slate-100/50 supports-[backdrop-filter]:bg-white/60"
        >
          <div className="flex-1 flex justify-start">{headerLeftAction}</div>
          
          <div className="flex-grow text-center">
            {typeof title === 'string' ? (
              <h1 className="text-lg font-bold tracking-tight text-slate-800">{title}</h1>
            ) : (
              <div className="text-lg font-bold tracking-tight text-slate-800">{title}</div>
            )}
          </div>
          
          <div className="flex-1 flex justify-end">{headerAction}</div>
        </header>

        {/* Content */}
        <main 
          className="flex-1 overflow-y-auto pb-32 pt-2 px-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="rounded-2xl p-4 shadow-2xl rotate-2 w-72 border border-indigo-100/50"
            style={{
              background: 'linear-gradient(135deg, white 0%, #f0f1ff 100%)',
              boxShadow: '0 20px 40px -8px rgba(99,102,241,0.3), 0 8px 16px -4px rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: `var(--color-weight-${activeTask.weight})` }}
              />
              <div className="font-bold text-sm text-slate-800 line-clamp-1">
                {activeTask.title}
              </div>
            </div>
            {activeTask.description && (
              <div className="text-xs mt-1 text-slate-400 line-clamp-1 ml-4">
                {activeTask.description}
              </div>
            )}
            <div className="mt-2 ml-4 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
              Trascina nel giorno →
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
