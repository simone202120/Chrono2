import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { AuthPage } from '@/pages/AuthPage'

function App() {
  const { user, loading, initialized, initialize, signOut } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  // Loading state
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Caricamento...
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!user) {
    return <AuthPage />
  }

  // Authenticated - show main app (placeholder for now)
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-semibold">📋 Agile Planner</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Benvenuto, <strong>{user.email}</strong>!
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <div
            className="px-4 py-2 text-white font-medium"
            style={{
              backgroundColor: 'var(--color-success)',
              borderRadius: '20px',
            }}
          >
            Sprint 1
          </div>
          <div
            className="px-4 py-2 text-white font-medium"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: '20px',
            }}
          >
            Task 1.3 ✓
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-8 px-6 py-2 rounded-xl font-medium text-white"
          style={{ backgroundColor: 'var(--color-destructive)' }}
        >
          Esci
        </button>
        <p
          className="text-sm mt-4"
          style={{ color: 'var(--color-text-placeholder)' }}
        >
          Autenticazione Magic Link funzionante ✓
        </p>
      </div>
    </div>
  )
}

export default App
