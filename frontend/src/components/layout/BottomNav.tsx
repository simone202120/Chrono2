import { NavLink } from 'react-router-dom'
import { Calendar, LayoutGrid, ListTodo } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', icon: Calendar, label: 'Oggi' },
  { to: '/settimana', icon: LayoutGrid, label: 'Settimana' },
  { to: '/backlog', icon: ListTodo, label: 'Backlog' },
]

/**
 * BottomNav - Floating navigation bar with labels
 * - Glassmorphism pill
 * - Labeled tabs with active pill highlight
 */
export function BottomNav() {
  const { goToToday } = useCalendar()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      <nav
        className="pointer-events-auto w-full max-w-sm flex items-center justify-around px-3 py-2 rounded-2xl glass-panel"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), 0 0 0 1px rgba(255,255,255,0.4)',
        }}
      >
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={to === '/' ? goToToday : undefined}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-0.5 transition-all duration-200 flex-1 py-1',
              isActive ? 'text-indigo-600' : 'text-slate-400'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'relative px-4 py-1.5 rounded-xl transition-all duration-200',
                  isActive ? 'bg-indigo-50' : 'bg-transparent'
                )}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-200"
                  />
                  {isActive && (
                    <span
                      className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-4 rounded-full bg-indigo-500 animate-scale-in"
                      style={{ width: '16px', left: '50%', transform: 'translateX(-50%)' }}
                    />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-semibold tracking-wide transition-all duration-200',
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
