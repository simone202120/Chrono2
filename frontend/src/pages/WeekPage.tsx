import { AppShell } from '@/components/layout/AppShell'

export function WeekPage() {
  return (
    <AppShell title="Settimana">
      <div className="p-4 space-y-4">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📆</div>
          <h2 className="text-lg font-semibold mb-2">Vista Settimana</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Qui vedrai la settimana con drag & drop
          </p>
        </div>
      </div>
    </AppShell>
  )
}
