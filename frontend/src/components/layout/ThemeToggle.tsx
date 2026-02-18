import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle - Revolut style dark/light mode switch
 * Uses CSS custom properties for instant theme switching
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-7 rounded-full bg-text-secondary/20 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-7 rounded-full transition-all duration-300 ease-spring"
      style={{
        backgroundColor: isDark ? 'var(--accent-primary)' : 'var(--bg-input)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px]">
        <Sun 
          size={12} 
          className="transition-all duration-300"
          style={{ 
            color: isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            opacity: isDark ? 0.5 : 1,
          }} 
        />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px]">
        <Moon 
          size={12} 
          className="transition-all duration-300"
          style={{ 
            color: isDark ? 'var(--text-inverse)' : 'var(--text-tertiary)',
            opacity: isDark ? 1 : 0.5,
          }} 
        />
      </span>
      
      {/* Sliding thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-spring flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-card)',
          transform: isDark ? 'translateX(22px)' : 'translateX(2px)',
        }}
      >
        {isDark ? (
          <Moon size={14} style={{ color: 'var(--accent-primary)' }} />
        ) : (
          <Sun size={14} style={{ color: 'var(--warning)' }} />
        )}
      </span>
    </button>
  );
}
