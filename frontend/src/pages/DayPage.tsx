import { useState, useMemo, useRef } from 'react'
import { format, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Sparkles, CheckCircle2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { AppShell } from '@/components/layout/AppShell'
import { SwipeableTaskCard } from '@/components/task/SwipeableTaskCard'
import { TaskForm } from '@/components/task/TaskForm'
import { useTaskStore } from '@/store/taskStore'
import { useCalendar } from '@/hooks/useCalendar'
import { toLocalISODateTime, cn } from '@/lib/utils'
import type { Task } from '@/types/task'

/**
 * DayPage - Vista giornaliera principale
 * - Swipe sinistra/destra sull'area vuota per navigare tra i giorni
 * - Task card con swipe indipendente (complete/delete)
 * - Drop zone per drag da backlog
 * - FAB per aggiungere
 */
export function DayPage() {
  const tasks = useTaskStore(state => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const {
    selectedDateISO,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    isToday,
    headerDateLabel,
  } = useCalendar()

  const { setNodeRef, isOver } = useDroppable({ id: selectedDateISO })
  const scheduleTask = useTaskStore(state => state.scheduleTask)

  // ── Swipe per cambiare giorno ──────────────────────────────────────────
  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Non intercettare swipe che partono da una task card
    const target = e.target as HTMLElement
    if (target.closest('[data-task-card]')) return
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - swipeStartX.current
    const deltaY = e.changedTouches[0].clientY - swipeStartY.current
    swipeStartX.current = null
    swipeStartY.current = null

    // Deve essere prevalentemente orizzontale (>55px, ratio X/Y > 1.5)
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return

    if (navigator.vibrate) navigator.vibrate(10)
    if (deltaX < 0) goToNextDay()
    else goToPreviousDay()
  }

  // ── Timezone-safe drop handler ─────────────────────────────────────────
  const handleTaskDrop = async (task: Task, dateString: string) => {
    await scheduleTask(task.id, toLocalISODateTime(dateString, '09:00'))
  }

  // ── Tasks del giorno ───────────────────────────────────────────────────
  const allDayTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (!task.scheduled_at) return false
        const taskDate = format(startOfDay(new Date(task.scheduled_at)), 'yyyy-MM-dd')
        return taskDate === selectedDateISO
      })
      .sort((a, b) => {
        if (!a.scheduled_at || !b.scheduled_at) return 0
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      })
  }, [tasks, selectedDateISO])

  const activeTasks = useMemo(() => allDayTasks.filter(t => t.status !== 'done'), [allDayTasks])
  const completedTasks = useMemo(() => allDayTasks.filter(t => t.status === 'done'), [allDayTasks])
  const totalWeight = useMemo(() => activeTasks.reduce((sum, t) => sum + t.weight, 0), [activeTasks])
  const completionRate = allDayTasks.length > 0
    ? Math.round((completedTasks.length / allDayTasks.length) * 100)
    : 0

  const headerLabel = useMemo(() => {
    const raw = headerDateLabel
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [headerDateLabel])

  return (
    <>
      <AppShell
        onTaskDrop={handleTaskDrop}
        title={
          <span
            className="text-base font-bold capitalize tracking-tight"
            style={{ color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
          >
            {headerLabel}
          </span>
        }
        headerLeftAction={
          <div className="flex items-center gap-0">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno precedente"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNextDay}
              className="p-2 rounded-xl active:bg-slate-100 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Giorno successivo"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="ml-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                Oggi
              </button>
            )}
          </div>
        }
      >
        {/* Area con swipe per cambiare giorno */}
        <div
          className="min-h-full pb-32"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Day Summary Card */}
          {allDayTasks.length > 0 && (
            <div
              className="mx-4 mt-3 mb-4 p-4 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }}
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: 'white' }} />
              <div className="absolute -right-1 -bottom-4 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: 'white' }} />

              <div className="flex-1 relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/60">
                  {isToday ? 'Oggi in agenda' : 'In agenda'}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{activeTasks.length}</span>
                  <span className="text-sm text-white/70 font-medium">
                    {activeTasks.length === 1 ? 'impegno' : 'impegni'}
                  </span>
                </div>
                {completedTasks.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/80 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/70">{completionRate}%</span>
                  </div>
                )}
              </div>
              {totalWeight > 0 && (
                <div
                  className="relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold text-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white', backdropFilter: 'blur(4px)' }}
                >
                  {totalWeight}
                  <span className="text-[9px] font-medium opacity-70">peso</span>
                </div>
              )}
            </div>
          )}

          {/* Drop zone + agenda */}
          <div
            ref={setNodeRef}
            className={cn(
              'mx-4 transition-all duration-200 rounded-2xl',
              isOver && 'ring-2 ring-indigo-400 ring-offset-2 bg-indigo-50/30'
            )}
          >
            {activeTasks.length > 0 ? (
              <div className="space-y-2.5">
                {activeTasks.map((task, index) => (
                  <div
                    key={task.id}
                    data-task-card="true"
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                  >
                    <SwipeableTaskCard task={task} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 animate-bounce-in"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #e0e7ff 100%)' }}
                >
                  <Sparkles size={34} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="font-bold text-slate-800 mb-1.5 text-base">
                  {isToday ? 'Giornata libera 🎉' : 'Nessun impegno'}
                </p>
                <p className="text-sm text-slate-400 mb-2 max-w-[220px] leading-relaxed">
                  {isToday
                    ? 'Aggiungi qualcosa o pianifica dal backlog'
                    : 'Scorri per cambiare giorno'}
                </p>
                <p className="text-xs text-slate-300 mb-6">← Scorri per cambiare giorno →</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    boxShadow: '0 4px 14px -2px rgba(88,86,214,0.4)',
                  }}
                >
                  + Aggiungi impegno
                </button>
              </div>
            )}

            {/* Completati collassabili */}
            {completedTasks.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCompleted(p => !p)}
                  className="w-full flex items-center gap-2 px-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors active:opacity-70"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Completati ({completedTasks.length})
                  <span className="ml-auto text-slate-300">{showCompleted ? '▲' : '▼'}</span>
                </button>
                {showCompleted && (
                  <div className="space-y-2 mt-1">
                    {completedTasks.map(task => (
                      <div key={task.id} data-task-card="true">
                        <SwipeableTaskCard task={task} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 flex items-center gap-2 px-4 h-14 rounded-2xl z-20 active:scale-95 transition-all duration-150 animate-bounce-in"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            boxShadow: 'var(--shadow-fab)',
          }}
          aria-label="Aggiungi impegno"
        >
          <Plus size={22} strokeWidth={2.5} color="white" />
          <span className="text-white font-bold text-sm pr-1">Nuovo</span>
        </button>
      </AppShell>

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          initialScheduledDate={selectedDateISO}
        />
      )}
    </>
  )
}
