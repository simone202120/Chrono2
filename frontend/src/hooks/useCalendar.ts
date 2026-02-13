import { useState, useCallback, useMemo } from 'react'
import {
  format,
  startOfDay,
  addDays,
  subDays,
  isSameDay,
  startOfWeek,
  addWeeks,
} from 'date-fns'
import { it } from 'date-fns/locale'

/**
 * useCalendar - Hook for calendar navigation
 * - Manages selected date state
 * - Navigation: previous/next day, previous/next week, go to today
 * - Week dates generation
 * - Date formatting helpers
 * - Check if date is today
 */
export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekOffset, setWeekOffset] = useState<number>(0)

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 1))
  }, [])

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => subDays(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
    setWeekOffset(0)
  }, [])

  const goToNextWeek = useCallback(() => {
    setWeekOffset(prev => prev + 1)
  }, [])

  const goToPreviousWeek = useCallback(() => {
    setWeekOffset(prev => prev - 1)
  }, [])

  // Get week dates (Monday to Sunday)
  const weekDates = useMemo(() => {
    const today = new Date()
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }) // 1 = Monday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekOffset])

  // Week range label (e.g., "10–16 Febbraio 2025")
  const weekRangeLabel = useMemo(() => {
    const firstDay = weekDates[0]
    const lastDay = weekDates[6]
    const firstDayNum = format(firstDay, 'd')
    const lastDayNum = format(lastDay, 'd')

    // Same month
    if (format(firstDay, 'M') === format(lastDay, 'M')) {
      return `${firstDayNum}–${lastDayNum} ${format(lastDay, 'MMMM yyyy', { locale: it })}`
    }
    // Different months
    return `${firstDayNum} ${format(firstDay, 'MMM', { locale: it })} – ${lastDayNum} ${format(lastDay, 'MMM yyyy', { locale: it })}`
  }, [weekDates])

  const isToday = useMemo(() => {
    return isSameDay(selectedDate, new Date())
  }, [selectedDate])

  const isYesterday = useMemo(() => {
    return isSameDay(selectedDate, subDays(new Date(), 1))
  }, [selectedDate])

  const isTomorrow = useMemo(() => {
    return isSameDay(selectedDate, addDays(new Date(), 1))
  }, [selectedDate])

  const dateLabel = useMemo(() => {
    if (isToday) return 'OGGI'
    if (isYesterday) return 'IERI'
    if (isTomorrow) return 'DOMANI'
    return format(selectedDate, 'd MMM', { locale: it }).toUpperCase()
  }, [selectedDate, isToday, isYesterday, isTomorrow])

  const headerDateLabel = useMemo(() => {
    return format(selectedDate, 'EEEE d MMMM', { locale: it })
  }, [selectedDate])

  const selectedDateISO = useMemo(() => {
    return format(startOfDay(selectedDate), "yyyy-MM-dd")
  }, [selectedDate])

  return {
    selectedDate,
    selectedDateISO,
    setSelectedDate,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    goToNextWeek,
    goToPreviousWeek,
    weekOffset,
    weekDates,
    weekRangeLabel,
    isToday,
    isYesterday,
    isTomorrow,
    dateLabel,
    headerDateLabel,
  }
}
