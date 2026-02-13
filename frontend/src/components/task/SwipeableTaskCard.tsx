import { useState, useRef } from 'react'
import { Trash2, CheckCircle2 } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types/task'

interface SwipeableTaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

const SWIPE_THRESHOLD = 80
const TAP_THRESHOLD = 10 // Max movement to be considered a tap

/**
 * SwipeableTaskCard - TaskCard with swipe gestures and detail view
 * - Swipe left → delete (red background)
 * - Swipe right → complete (green background)
 * - Tap → open TaskDetail bottom sheet
 * - Threshold: 80px for swipe, 10px for tap detection
 * - Confirm dialog for delete
 */
export function SwipeableTaskCard({ task, onEdit }: SwipeableTaskCardProps) {
  const deleteTask = useTaskStore(state => state.deleteTask)
  const completeTask = useTaskStore(state => state.completeTask)

  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentXRef = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    currentXRef.current = e.clientX
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    currentXRef.current = e.clientX
    const deltaX = currentXRef.current - startXRef.current

    // Limit swipe to -150 (left) and +150 (right)
    const clampedDelta = Math.max(-150, Math.min(150, deltaX))
    setTranslateX(clampedDelta)
  }

  const handlePointerUp = async () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaX = currentXRef.current - startXRef.current
    const totalMovement = Math.abs(deltaX)

    // If movement is minimal, treat as tap and open detail
    if (totalMovement < TAP_THRESHOLD && task.status !== 'done') {
      setShowDetail(true)
      setTranslateX(0)
      return
    }

    // Swipe left (delete)
    if (deltaX < -SWIPE_THRESHOLD) {
      const confirmDelete = window.confirm(
        `Eliminare l'impegno "${task.title}"?`
      )
      if (confirmDelete) {
        // Animate out
        setTranslateX(-400)
        setTimeout(() => {
          deleteTask(task.id)
        }, 200)
      } else {
        // Spring back
        setTranslateX(0)
      }
    }
    // Swipe right (complete)
    else if (deltaX > SWIPE_THRESHOLD) {
      // Complete task
      await completeTask(task.id)
      setTranslateX(0)
    }
    // Not enough swipe
    else {
      setTranslateX(0)
    }
  }

  const handlePointerCancel = () => {
    setIsDragging(false)
    setTranslateX(0)
  }

  const handleCardClick = () => {
    setShowDetail(true)
  }

  // Don't allow swipe on already completed tasks, but allow tap to see details
  if (task.status === 'done') {
    return (
      <>
        <TaskCard task={task} onClick={handleCardClick} />
        {showDetail && (
          <TaskDetail
            task={task}
            onClose={() => setShowDetail(false)}
            onEdit={onEdit}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        {/* Background actions */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          {/* Left action (delete - visible when swiping left) */}
          <div
            className="flex items-center gap-2"
            style={{
              opacity: translateX < 0 ? Math.abs(translateX) / SWIPE_THRESHOLD : 0,
              transform: `translateX(${Math.min(0, translateX + 20)}px)`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <Trash2 size={24} style={{ color: 'var(--color-destructive)' }} />
          </div>

          {/* Right action (complete - visible when swiping right) */}
          <div
            className="flex items-center gap-2"
            style={{
              opacity: translateX > 0 ? translateX / SWIPE_THRESHOLD : 0,
              transform: `translateX(${Math.max(0, translateX - 20)}px)`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        {/* Card overlay */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            touchAction: 'pan-y', // Allow vertical scroll
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <TaskCard task={task} />
        </div>
      </div>

      {/* Task detail bottom sheet */}
      {showDetail && (
        <TaskDetail
          task={task}
          onClose={() => setShowDetail(false)}
          onEdit={onEdit}
        />
      )}
    </>
  )
}
