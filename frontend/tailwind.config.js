/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS-inspired palette from DESIGN_SPEC.md
        background: {
          main: '#F2F2F7',
          card: '#FFFFFF',
          section: '#EFEFF4',
        },
        text: {
          primary: '#1C1C1E',
          secondary: '#8E8E93',
          placeholder: '#C7C7CC',
        },
        primary: '#007AFF',
        destructive: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        separator: '#C6C6C8',
        // Weight colors (task priority)
        weight: {
          1: '#34C759', // Leggero (green)
          2: '#007AFF', // Normale (blue)
          3: '#FF9F0A', // Medio (yellow)
          4: '#FF6B00', // Impegnativo (orange)
          5: '#FF3B30', // Critico (red)
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro"',
          'Roboto',
          'Inter',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '12px',
        badge: '6px',
        pill: '20px',
      },
      spacing: {
        'safe-bottom': '83px', // Bottom nav + safe area
        'header': '52px',
      },
    },
  },
  plugins: [],
}
