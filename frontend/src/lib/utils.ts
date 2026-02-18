import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * Used for conditional class names in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get color for task weight (1-5)
 * Returns CSS variable value or hex color
 */
export function getWeightColor(weight: number): string {
  const colors: Record<number, string> = {
    1: '#00E5CC', // Cyan
    2: '#00D9FF', // Sky
    3: '#5E72E4', // Indigo
    4: '#FF6B9D', // Pink
    5: '#FF2D55', // Red
  }
  return colors[weight] || colors[3]
}

/**
 * Get shadow class for task weight
 */
export function getWeightShadow(weight: number): string {
  const shadows: Record<number, string> = {
    1: 'shadow-cyan',
    2: 'shadow-blue',
    3: 'shadow-indigo',
    4: 'shadow-pink',
    5: 'shadow-red',
  }
  return shadows[weight] || 'shadow-card'
}
