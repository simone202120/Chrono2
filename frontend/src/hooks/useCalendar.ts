import { useState, useCallback, useMemo } from 'react'
import { format, startOfDay, addDays, subDays, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale'

/**
 * useCalendar - Hook for calendar navigation
 * - Manages selected date state
 * - Navigation: previous/next day, go to today
 * - Date formatting helpers
 * - Check if date is today
 */
export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 1))
  }, [])

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => subDays(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

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
    isToday,
    isYesterday,
    isTomorrow,
    dateLabel,
    headerDateLabel,
  }
}
