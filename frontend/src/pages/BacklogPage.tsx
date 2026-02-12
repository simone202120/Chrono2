import { AppShell } from '@/components/layout/AppShell'
import { Plus } from 'lucide-react'

export function BacklogPage() {
  return (
    <AppShell
      title="Backlog"
      headerAction={
        <button
          className="p-2"
          style={{ color: 'var(--color-primary)' }}
          aria-label="Aggiungi al backlog"
        >
          <Plus size={24} strokeWidth={2} />
        </button>
      }
    >
      <div className="p-4 space-y-4">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold mb-2">Backlog</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Qui vedrai tutti i task non schedulati
          </p>
        </div>
      </div>
    </AppShell>
  )
}
