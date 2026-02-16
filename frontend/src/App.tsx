import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { AuthPage } from '@/pages/AuthPage'
import { DayPage } from '@/pages/DayPage'
import { WeekPage } from '@/pages/WeekPage'
import { BacklogPage } from '@/pages/BacklogPage'

function App() {
  const { user, loading, initialized, initialize } = useAuthStore()
  const fetchTasks = useTaskStore(state => state.fetchTasks)

  // Initialize auth
  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  // Fetch tasks when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, fetchTasks])

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DayPage />} />
        <Route path="/settimana" element={<WeekPage />} />
        <Route path="/backlog" element={<BacklogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
