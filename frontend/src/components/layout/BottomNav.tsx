import { NavLink, useLocation } from 'react-router-dom'
import { Calendar, LayoutGrid, ListTodo } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useEffect, useState } from 'react'

/**
 * BottomNav - Revolut Style Floating Pill Navigation
 * - Centered floating pill
 * - Animated dot indicator
 * - Dark mode support
 * - Clean minimal design
 */
export function BottomNav() {
  const { goToToday } = useCalendar()
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(0)

  const tabs = [
    { to: '/', icon: Calendar, label: 'Oggi' },
    { to: '/settimana', icon: LayoutGrid, label: 'Settimana' },
    { to: '/backlog', icon: ListTodo, label: 'Backlog' },
  ]

  useEffect(() => {
    const index = tabs.findIndex(tab => {
      if (tab.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(tab.to)
    })
    setActiveIndex(index >= 0 ? index : 0)
  }, [location.pathname])

  const handleClick = (index: number, to: string) => {
    if (to === '/') {
      goToToday()
    }
    setActiveIndex(index)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 pt-2 px-6 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-pill"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          boxShadow: 'var(--shadow-floating)',
          border: '1px solid var(--border-default)',
        }}
      >
        {tabs.map(({ to, icon: Icon, label }, index) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => handleClick(index, to)}
            className="relative flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300"
            style={{
              backgroundColor: activeIndex === index ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            <Icon 
              size={22} 
              strokeWidth={activeIndex === index ? 2.5 : 2}
              style={{
                color: activeIndex === index ? 'var(--text-inverse)' : 'var(--text-secondary)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
            
            {/* Active dot indicator */}
            {activeIndex === index && (
              <span 
                className="absolute -bottom-0.5 w-1 h-1 rounded-full animate-fade-in"
                style={{ backgroundColor: 'var(--text-inverse)' }}
              />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
