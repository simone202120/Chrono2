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
import { ThemeToggle } from './ThemeToggle'
import type { Task } from '@/types/task'
import { getWeightColor } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  title?: ReactNode
  headerAction?: ReactNode
  showThemeToggle?: boolean
  onTaskDrop?: (task: Task, dateString: string) => void
}

/**
 * AppShell - Revolut Modern Layout
 * - Clean minimalist header
 * - Floating bottom nav
 * - Dark mode support
 * - Enhanced drag & drop
 */
export function AppShell({
  children,
  title,
  headerAction,
  showThemeToggle = true,
  onTaskDrop,
}: AppShellProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.data.current?.task) {
      const task = active.data.current.task as Task
      const dateString = over.id as string
      onTaskDrop?.(task, dateString)
      if (navigator.vibrate) navigator.vibrate(50)
    }
    setActiveTask(null)
  }

  const handleDragCancel = () => setActiveTask(null)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Header - Minimalist Revolut Style */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Left - Theme Toggle */}
          <div className="flex-1 flex justify-start">
            {showThemeToggle && <ThemeToggle />}
          </div>
          
          {/* Center - Title */}
          <div className="flex-grow flex justify-center">
            {typeof title === 'string' ? (
              <h1 
                className="text-xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h1>
            ) : (
              <div style={{ color: 'var(--text-primary)' }}>{title}</div>
            )}
          </div>
          
          {/* Right - Action */}
          <div className="flex-1 flex justify-end">
            {headerAction}
          </div>
        </header>

        {/* Content */}
        <main 
          className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-28"
          style={{ scrollBehavior: 'smooth' }}
        >
          {children}
        </main>

        {/* Bottom Navigation - Floating Pill */}
        <BottomNav />
      </div>

      {/* Drag Overlay - Revolut Style */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <DragOverlayCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

/**
 * Drag Overlay Card - Revolut style floating card
 */
function DragOverlayCard({ task }: { task: Task }) {
  const weightColor = getWeightColor(task.weight)
  
  return (
    <div
      className="rounded-card p-4 w-72 rotate-2"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: `0 8px 32px ${weightColor}40`,
        border: `1px solid ${weightColor}30`,
      }}
    >
      {/* Weight indicator bar */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
        style={{ backgroundColor: weightColor }}
      />
      
      <div className="pl-3">
        <div 
          className="font-semibold text-base"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </div>
        {task.description && (
          <div 
            className="text-sm mt-1 line-clamp-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {task.description}
          </div>
        )}
      </div>
    </div>
  )
}
