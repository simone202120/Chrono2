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
 * AppShell - Main layout wrapper with drag & drop context
 * - DndContext with touch and mouse sensors
 * - Header with dynamic title and optional action buttons
 * - Scrollable content area
 * - Bottom navigation
 * - iOS safe areas support
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
      distance: 10, // 10px tolerance before drag starts
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150, // 150ms long press
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

      // Call the drop handler if provided
      if (onTaskDrop) {
        onTaskDrop(task, dateString)
      }

      // Haptic feedback if available
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
      <div
        className="min-h-screen flex flex-col"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-4"
          style={{
            height: '52px',
            backgroundColor: 'var(--color-background-main)',
            borderBottom: '1px solid var(--color-separator)',
          }}
        >
          <div className="flex-1 flex justify-start">{headerLeftAction}</div>
          {typeof title === 'string' ? (
            <h1 className="text-base font-semibold">{title || 'Agile Planner'}</h1>
          ) : (
            <div className="text-base font-semibold">{title || 'Agile Planner'}</div>
          )}
          <div className="flex-1 flex justify-end">{headerAction}</div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-safe-bottom">{children}</main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="rounded-xl p-3 shadow-lg"
            style={{
              backgroundColor: 'var(--color-background-card)',
              border: '1px solid var(--color-separator)',
              opacity: 0.8,
              transform: 'rotate(2deg)',
              width: '280px',
            }}
          >
            <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {activeTask.title}
            </div>
            {activeTask.description && (
              <div
                className="text-xs mt-1 line-clamp-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {activeTask.description}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
