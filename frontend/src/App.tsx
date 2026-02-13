import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { AuthPage } from '@/pages/AuthPage'
import { DayPage } from '@/pages/DayPage'
import { WeekPage } from '@/pages/WeekPage'
import { BacklogPage } from '@/pages/BacklogPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  const { user, loading, initialized, initialize } = useAuthStore()

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

  // Authenticated - show main app with routing
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-background-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-separator)',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DayPage />} />
          <Route path="/settimana" element={<WeekPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
