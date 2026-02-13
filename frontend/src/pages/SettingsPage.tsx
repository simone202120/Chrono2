import { useState } from 'react'
import { ChevronRight, Download } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { toast } from 'sonner'

/**
 * SettingsPage - User settings and preferences
 * - Account: email, sign out
 * - Notifications: push notifications toggle
 * - Preferences: default view, first day of week
 * - Data: export tasks (JSON, CSV)
 */
export function SettingsPage() {
  const user = useAuthStore(state => state.user)
  const signOut = useAuthStore(state => state.signOut)
  const tasks = useTaskStore(state => state.tasks)

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification.permission === 'granted'
  )
  const [defaultView, setDefaultView] = useState<'day' | 'week' | 'backlog'>('day')
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'monday' | 'sunday'>('monday')

  const handleSignOut = async () => {
    const confirmed = window.confirm('Sei sicuro di voler uscire?')
    if (confirmed) {
      await signOut()
    }
  }

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        toast.success('Notifiche attivate')
      } else {
        toast.error('Permesso notifiche negato')
      }
    } else {
      setNotificationsEnabled(false)
      toast.success('Notifiche disattivate')
    }
  }

  const exportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agile-planner-tasks-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('File JSON scaricato')
  }

  const exportCSV = () => {
    const headers = ['Titolo', 'Descrizione', 'Peso', 'Stato', 'Data Creazione', 'Scadenza', 'Schedulato']
    const rows = tasks.map(t => [
      t.title,
      t.description || '',
      t.weight.toString(),
      t.status,
      t.created_at,
      t.due_date || '',
      t.scheduled_at || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agile-planner-tasks-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('File CSV scaricato')
  }

  return (
    <AppShell title="Impostazioni">
      <div className="min-h-full" style={{ backgroundColor: 'var(--color-background-main)' }}>
        {/* Account Section */}
        <div className="mb-6">
          <h2
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Account
          </h2>
          <div style={{ backgroundColor: 'var(--color-background-card)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-separator)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </p>
              <p className="text-base">{user?.email || 'Non disponibile'}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left flex items-center justify-between"
            >
              <span style={{ color: 'var(--color-destructive)' }}>Esci</span>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h2
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Notifiche
          </h2>
          <div style={{ backgroundColor: 'var(--color-background-card)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-base">Notifiche attive</span>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-separator)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h2
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Preferenze
          </h2>
          <div style={{ backgroundColor: 'var(--color-background-card)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-separator)' }}>
              <label className="text-sm mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Vista predefinita
              </label>
              <select
                value={defaultView}
                onChange={e => setDefaultView(e.target.value as 'day' | 'week' | 'backlog')}
                className="w-full px-3 py-2 rounded-lg text-base"
                style={{
                  backgroundColor: 'var(--color-background-section)',
                  border: '1px solid var(--color-separator)',
                }}
              >
                <option value="day">Oggi</option>
                <option value="week">Settimana</option>
                <option value="backlog">Backlog</option>
              </select>
            </div>
            <div className="px-4 py-3">
              <label className="text-sm mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Primo giorno settimana
              </label>
              <select
                value={firstDayOfWeek}
                onChange={e => setFirstDayOfWeek(e.target.value as 'monday' | 'sunday')}
                className="w-full px-3 py-2 rounded-lg text-base"
                style={{
                  backgroundColor: 'var(--color-background-section)',
                  border: '1px solid var(--color-separator)',
                }}
              >
                <option value="monday">Lunedì</option>
                <option value="sunday">Domenica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="mb-6">
          <h2
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Dati
          </h2>
          <div style={{ backgroundColor: 'var(--color-background-card)' }}>
            <button
              onClick={exportJSON}
              className="w-full px-4 py-3 text-left flex items-center justify-between border-b"
              style={{ borderColor: 'var(--color-separator)' }}
            >
              <span className="flex items-center gap-2">
                <Download size={18} style={{ color: 'var(--color-primary)' }} />
                <span className="text-base">Esporta task (JSON)</span>
              </span>
              <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <button
              onClick={exportCSV}
              className="w-full px-4 py-3 text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Download size={18} style={{ color: 'var(--color-primary)' }} />
                <span className="text-base">Esporta task (CSV)</span>
              </span>
              <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Version info */}
        <div className="px-4 py-4 text-center">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Agile Planner v1.0.0
          </p>
        </div>
      </div>
    </AppShell>
  )
}
