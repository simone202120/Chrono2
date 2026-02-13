import type { TaskWeight } from '@/types/task'

interface WeightBadgeProps {
  weight: TaskWeight
  size?: 'sm' | 'md' | 'lg'
}

const WEIGHT_COLORS: Record<TaskWeight, string> = {
  1: 'var(--color-weight-1)', // Verde
  2: 'var(--color-weight-2)', // Blu
  3: 'var(--color-weight-3)', // Giallo
  4: 'var(--color-weight-4)', // Arancione
  5: 'var(--color-weight-5)', // Rosso
}

const WEIGHT_LABELS: Record<TaskWeight, string> = {
  1: 'Leggero',
  2: 'Normale',
  3: 'Medio',
  4: 'Impegnativo',
  5: 'Critico',
}

/**
 * WeightBadge - Visual indicator for task weight
 * - Colored pill with number
 * - Colors from green (1) to red (5)
 * - Shows task complexity at a glance
 */
export function WeightBadge({ weight, size = 'md' }: WeightBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-lg',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white transition-transform duration-200 hover:scale-110 ${sizeClasses[size]}`}
      style={{
        backgroundColor: WEIGHT_COLORS[weight],
      }}
      title={WEIGHT_LABELS[weight]}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80" />
      {weight}
    </span>
  )
}
