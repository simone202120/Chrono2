import { NavLink } from 'react-router-dom'
import { Calendar, LayoutGrid, ListTodo, Plus } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { cn } from '@/lib/utils'

/**
 * BottomNav - Modern Floating Navigation
 * - Glassmorphism effect
 * - Active tab indicator (dot or color change)
 * - Improved iconography
 */
export function BottomNav() {
  const { goToToday } = useCalendar()

  const tabs = [
    { to: '/', icon: Calendar, label: 'Oggi', onClick: goToToday },
    { to: '/settimana', icon: LayoutGrid, label: 'Settimana' },
    { to: '/backlog', icon: ListTodo, label: 'Backlog' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-0 pointer-events-none flex justify-center">
      <nav
        className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-2xl glass-panel shadow-lg border border-white/50 w-full max-w-sm mx-auto"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        {tabs.map(({ to, icon: Icon, label, onClick }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-2",
              isActive ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-indigo-50" : "bg-transparent"
                )}>
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={cn("transition-transform", isActive && "-translate-y-0.5")}
                  />
                </div>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600 animate-fade-in" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
