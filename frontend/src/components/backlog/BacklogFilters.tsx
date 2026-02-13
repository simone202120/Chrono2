import { useState } from 'react'
import { X } from 'lucide-react'

export type SortOption =
  | 'weight-desc'
  | 'weight-asc'
  | 'due-date-asc'
  | 'created-at-desc'

export interface BacklogFiltersState {
  sortBy: SortOption
  dueSoon: boolean
  noDueDate: boolean
  highPriority: boolean
  recurringOnly: boolean
}

interface BacklogFiltersProps {
  currentFilters: BacklogFiltersState
  onApply: (filters: BacklogFiltersState) => void
  onClose: () => void
}

const defaultFilters: BacklogFiltersState = {
  sortBy: 'weight-desc',
  dueSoon: false,
  noDueDate: false,
  highPriority: false,
  recurringOnly: false,
}

/**
 * BacklogFilters - Bottom sheet for sorting and filtering backlog
 * - Sort options: weight, due date, created date
 * - Filter options: due soon, no due date, high priority, recurring
 * - Apply/Reset buttons
 */
export function BacklogFilters({
  currentFilters,
  onApply,
  onClose,
}: BacklogFiltersProps) {
  const [filters, setFilters] = useState<BacklogFiltersState>(currentFilters)

  const handleReset = () => {
    setFilters(defaultFilters)
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'weight-desc', label: 'Peso (dal più alto)' },
    { value: 'weight-asc', label: 'Peso (dal più basso)' },
    { value: 'due-date-asc', label: 'Scadenza (prima le più vicine)' },
    { value: 'created-at-desc', label: 'Data aggiunta (più recenti)' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        style={{
          backgroundColor: 'var(--color-background-card)',
          animationTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-separator)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Ordina e Filtra</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Sort section */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Ordina per</h3>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                  style={{
                    borderColor:
                      filters.sortBy === option.value
                        ? 'var(--color-primary)'
                        : 'var(--color-separator)',
                    backgroundColor:
                      filters.sortBy === option.value
                        ? 'rgba(0, 122, 255, 0.05)'
                        : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={e =>
                      setFilters({ ...filters, sortBy: e.target.value as SortOption })
                    }
                    className="w-5 h-5"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter section */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Filtra per</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dueSoon}
                  onChange={e =>
                    setFilters({ ...filters, dueSoon: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div>In scadenza</div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Entro 7 giorni
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.noDueDate}
                  onChange={e =>
                    setFilters({ ...filters, noDueDate: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Senza data di scadenza</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.highPriority}
                  onChange={e =>
                    setFilters({ ...filters, highPriority: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div>Alta priorità</div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Peso 4-5
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.recurringOnly}
                  onChange={e =>
                    setFilters({ ...filters, recurringOnly: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Solo ricorrenti</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl font-semibold border"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-separator)',
                backgroundColor: 'transparent',
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Applica
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to count active filters (excluding sortBy default)
export function countActiveFilters(filters: BacklogFiltersState): number {
  let count = 0
  if (filters.sortBy !== 'weight-desc') count++
  if (filters.dueSoon) count++
  if (filters.noDueDate) count++
  if (filters.highPriority) count++
  if (filters.recurringOnly) count++
  return count
}
