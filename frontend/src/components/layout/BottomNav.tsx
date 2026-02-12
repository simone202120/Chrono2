import { NavLink } from 'react-router-dom'
import { Calendar, CalendarDays, List } from 'lucide-react'

/**
 * BottomNav - Bottom navigation bar
 * - 3 tabs: Oggi (Day), Settimana (Week), Backlog
 * - iOS-styled with safe area padding
 * - Active tab highlighted in primary color
 */
export function BottomNav() {
  const tabs = [
    { to: '/', icon: Calendar, label: 'Oggi' },
    { to: '/settimana', icon: CalendarDays, label: 'Settimana' },
    { to: '/backlog', icon: List, label: 'Backlog' },
  ]

  return (
    <nav
      className="sticky bottom-0 flex items-center justify-around border-t"
      style={{
        height: '83px',
        backgroundColor: 'var(--color-background-card)',
        borderColor: 'var(--color-separator)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      }}
    >
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2"
          style={({ isActive }) => ({
            color: isActive
              ? 'var(--color-primary)'
              : 'var(--color-text-secondary)',
          })}
        >
          <Icon size={24} strokeWidth={2} />
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
