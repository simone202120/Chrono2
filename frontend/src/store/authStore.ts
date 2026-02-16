import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
}

type AuthStore = AuthState & AuthActions

/**
 * Auth Store - Manages authentication state with Supabase
 * - Handles magic link sign in/out
 * - Auto-initializes on mount with session persistence
 * - Listens to auth state changes
 */
export const useAuthStore = create<AuthStore>(set => ({
  // State
  user: null,
  session: null,
  loading: true,
  initialized: false,

  // Actions
  initialize: async () => {
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      set({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session,
          loading: false,
        })
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false, initialized: true })
    }
  },

  signIn: async (email: string) => {
    try {
      // Use env variable if set, otherwise fallback to current origin
      // VITE_APP_URL should be set to production URL on Vercel
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { error: error as Error }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },

  setUser: user => set({ user }),
  setSession: session => set({ session }),
}))
