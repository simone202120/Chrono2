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
const TAP_THRESHOLD = 8 // Max movement (px) to be considered a tap

/**
 * SwipeableTaskCard - TaskCard with swipe gestures and detail view
 * - Swipe left → delete (red background)
 * - Swipe right → complete (green background)
 * - Tap → open TaskDetail bottom sheet
 * - UX fix: usa ref per isDragging (evita problemi di closure con stato React)
 * - touchAction: pan-y per permettere scroll verticale
 */
export function SwipeableTaskCard({ task, onEdit }: SwipeableTaskCardProps) {
  const deleteTask = useTaskStore(state => state.deleteTask)
  const completeTask = useTaskStore(state => state.completeTask)

  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false) // solo per CSS transition
  const [showDetail, setShowDetail] = useState(false)

  // Ref per tracking immediato senza dipendere dal ciclo di render React
  const isActiveRef = useRef(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignora click destro o multi-touch
    if (e.button !== 0 && e.pointerType === 'mouse') return
    isActiveRef.current = true
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    setIsSwiping(true)
    // Capture pointer per ricevere eventi anche fuori dall'elemento
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActiveRef.current) return

    currentXRef.current = e.clientX
    const deltaX = currentXRef.current - startXRef.current
    const clampedDelta = Math.max(-150, Math.min(150, deltaX))
    setTranslateX(clampedDelta)
  }

  const handlePointerUp = async () => {
    if (!isActiveRef.current) return
    isActiveRef.current = false
    setIsSwiping(false)

    const deltaX = currentXRef.current - startXRef.current
    const totalMovement = Math.abs(deltaX)

    // Tap: movimento minimo → apri dettaglio
    if (totalMovement < TAP_THRESHOLD) {
      setTranslateX(0)
      setShowDetail(true)
      return
    }

    // Swipe left → elimina
    if (deltaX < -SWIPE_THRESHOLD) {
      const confirmDelete = window.confirm(`Eliminare "${task.title}"?`)
      if (confirmDelete) {
        setTranslateX(-400)
        setTimeout(() => deleteTask(task.id), 200)
      } else {
        setTranslateX(0)
      }
      return
    }

    // Swipe right → completa
    if (deltaX > SWIPE_THRESHOLD) {
      if (navigator.vibrate) navigator.vibrate(30)
      await completeTask(task.id)
      setTranslateX(0)
      return
    }

    // Movimento insufficiente → torna a posto
    setTranslateX(0)
  }

  const handlePointerCancel = () => {
    isActiveRef.current = false
    setIsSwiping(false)
    setTranslateX(0)
  }

  // Task completati: solo tap, nessuno swipe
  if (task.status === 'done') {
    return (
      <>
        <TaskCard task={task} onClick={() => setShowDetail(true)} />
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

  const swipeProgress = Math.abs(translateX) / SWIPE_THRESHOLD
  const isSwipingLeft = translateX < -10
  const isSwipingRight = translateX > 10

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          backgroundColor: isSwipingLeft
            ? `rgba(239,68,68,${Math.min(swipeProgress * 0.15, 0.12)})`
            : isSwipingRight
              ? `rgba(16,185,129,${Math.min(swipeProgress * 0.15, 0.12)})`
              : 'transparent',
        }}
      >
        {/* Background actions */}
        <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
          <div
            style={{
              opacity: isSwipingLeft ? Math.min(swipeProgress, 1) : 0,
              transform: `scale(${0.8 + Math.min(swipeProgress, 1) * 0.2})`,
              transition: isSwiping ? 'none' : 'all 0.25s ease-out',
            }}
          >
            <Trash2 size={22} style={{ color: 'var(--color-destructive)' }} />
          </div>
          <div
            style={{
              opacity: isSwipingRight ? Math.min(swipeProgress, 1) : 0,
              transform: `scale(${0.8 + Math.min(swipeProgress, 1) * 0.2})`,
              transition: isSwiping ? 'none' : 'all 0.25s ease-out',
            }}
          >
            <CheckCircle2 size={22} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        {/* Card */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            touchAction: 'pan-y',
            cursor: isSwiping ? 'grabbing' : 'pointer',
            userSelect: 'none',
          }}
        >
          <TaskCard task={task} />
        </div>
      </div>

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
