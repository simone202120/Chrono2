import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signIn = useAuthStore(state => state.signIn)
  const signInWithGoogle = useAuthStore(state => state.signInWithGoogle)

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

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    const { error: signInError } = await signInWithGoogle()

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
    // User will be redirected to Google OAuth, no need to setLoading(false)
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

        {/* Google Sign In Button */}
        <div className="space-y-4">
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
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold border-2 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--color-separator)',
              color: 'var(--color-text-primary)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            {loading ? 'Accesso in corso...' : 'Continua con Google'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div
              className="w-full border-t"
              style={{ borderColor: 'var(--color-separator)' }}
            />
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-4 bg-white"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              oppure
            </span>
          </div>
        </div>

        {/* Email Form */}
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
