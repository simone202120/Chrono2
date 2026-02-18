import { NavLink } from 'react-router-dom'
import { Calendar, LayoutGrid, ListTodo } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'

const tabs = [
  { to: '/', icon: Calendar, label: 'Oggi' },
  { to: '/settimana', icon: LayoutGrid, label: 'Settimana' },
  { to: '/backlog', icon: ListTodo, label: 'Backlog' },
]

/**
 * BottomNav — iOS-style tab bar
 * - Hairline separator on top
 * - Glass background with strong blur
 * - Active: icon + label in primary color, bolder stroke
 * - Inactive: gray icon + label
 * - Safe area for home indicator
 */
export function BottomNav() {
  const { goToToday } = useCalendar()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* iOS hairline separator */}
      <div style={{ height: '0.5px', backgroundColor: 'var(--color-separator-opaque)' }} />

      {/* Tab bar */}
      <nav
        className="flex items-stretch justify-around bg-white/90 backdrop-blur-2xl"
        style={{
          paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
          paddingTop: '8px',
        }}
      >
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={to === '/' ? goToToday : undefined}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5 py-0.5 transition-all duration-150 active:opacity-60">
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? 'var(--color-primary)' : '#8E8E93' }}
                  className="transition-all duration-150"
                />
                <span
                  className="text-[10px] font-medium tracking-tight transition-all duration-150"
                  style={{ color: isActive ? 'var(--color-primary)' : '#8E8E93' }}
                >
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
