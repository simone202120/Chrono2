import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title?: string
  headerAction?: ReactNode
}

/**
 * AppShell - Main layout wrapper
 * - Header with dynamic title and optional action button
 * - Scrollable content area
 * - Bottom navigation
 * - iOS safe areas support
 */
export function AppShell({ children, title, headerAction }: AppShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4"
        style={{
          height: '52px',
          backgroundColor: 'var(--color-background-main)',
          borderBottom: '1px solid var(--color-separator)',
        }}
      >
        <div className="flex-1" />
        <h1 className="text-base font-semibold">{title || 'Agile Planner'}</h1>
        <div className="flex-1 flex justify-end">{headerAction}</div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-safe-bottom">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
