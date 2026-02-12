import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signIn = useAuthStore(state => state.signIn)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md space-y-6">
          <div
            className="text-6xl mb-4"
            style={{ color: 'var(--color-success)' }}
          >
            ✓
          </div>
          <h2 className="text-2xl font-semibold">Link inviato!</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Controlla la tua email <strong>{email}</strong> e clicca sul link
            per accedere.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm"
            style={{ color: 'var(--color-primary)' }}
          >
            Cambia email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl mb-3">📋</h1>
          <h2 className="text-2xl font-semibold">Agile Planner</h2>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Gestisci i tuoi impegni in stile agile
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tuo@email.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border text-base"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-separator)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                color: 'var(--color-destructive)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
          >
            {loading ? 'Invio in corso...' : 'Invia link di accesso'}
          </button>
        </form>

        <p
          className="text-xs text-center"
          style={{ color: 'var(--color-text-placeholder)' }}
        >
          Ti invieremo un link magico per accedere senza password
        </p>
      </div>
    </div>
  )
}
