import { useState, useEffect } from 'react'

/**
 * Hook to track online/offline status
 * Listens to window online/offline events
 * @returns boolean - true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current status
    if (typeof navigator !== 'undefined') {
      return navigator.onLine
    }
    return true
  })

  useEffect(() => {
    // Handler for online event
    const handleOnline = () => {
      console.log('🌐 Network: Online')
      setIsOnline(true)
    }

    // Handler for offline event
    const handleOffline = () => {
      console.log('📴 Network: Offline')
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
