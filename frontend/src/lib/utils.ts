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
 * Crea una stringa datetime ISO con offset timezone locale.
 * Corregge il bug per cui Supabase/PostgreSQL interpreta datetime
 * senza timezone come UTC, causando scorrimento dell'orario
 * per utenti in fusi orari diversi da UTC.
 *
 * Es: "2026-02-18" + "18:00" → "2026-02-18T18:00:00+01:00"
 */
export function toLocalISODateTime(dateStr: string, timeStr: string): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = new Date(`${dateStr}T${timeStr}:00`)
  const offset = -date.getTimezoneOffset() // negativo di getTimezoneOffset = offset locale
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  return `${dateStr}T${timeStr}:00${sign}${pad(hours)}:${pad(minutes)}`
}

/**
 * Ritorna il datetime "oggi alle HH:MM" con offset timezone locale
 */
export function todayAtTime(timeStr: string): string {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  return toLocalISODateTime(dateStr, timeStr)
}
