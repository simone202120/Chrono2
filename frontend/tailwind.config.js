/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Revolut Modern Design System
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          elevated: 'var(--bg-elevated)',
          input: 'var(--bg-input)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        // Weight colors - Gradient from Cyan to Red
        weight: {
          1: 'var(--color-weight-1)', // Cyan #00E5CC
          2: 'var(--color-weight-2)', // Sky #00D9FF
          3: 'var(--color-weight-3)', // Indigo #5E72E4
          4: 'var(--color-weight-4)', // Pink #FF6B9D
          5: 'var(--color-weight-5)', // Red #FF2D55
        },
        // Status colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        destructive: 'var(--color-destructive)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        'card': '20px',
        'pill': '28px',
        'sheet': '28px',
        'badge': '12px',
      },
      spacing: {
        'safe-bottom': '100px', // Bottom nav + safe area
        'safe-top': '52px',
        'header': '64px',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-card)',
        'floating': 'var(--shadow-floating)',
        'cyan': '0 4px 20px rgba(0, 229, 204, 0.25)',
        'blue': '0 4px 20px rgba(0, 217, 255, 0.25)',
        'indigo': '0 4px 20px rgba(94, 114, 228, 0.25)',
        'pink': '0 4px 20px rgba(255, 107, 157, 0.25)',
        'red': '0 4px 20px rgba(255, 45, 85, 0.25)',
      },
      animation: {
        'fade-in': 'fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
}
