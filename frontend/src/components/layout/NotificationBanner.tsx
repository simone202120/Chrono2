import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

/**
 * NotificationBanner - iOS-style banner to request notification permission
 * - Shown once on first visit
 * - Can be dismissed (saves preference in localStorage)
 * - Requests permission and subscribes to push notifications
 */
export function NotificationBanner() {
  const { isSupported, permission, subscribeToPush } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if banner should be shown
    const dismissed = localStorage.getItem('notification-banner-dismissed')
    const shouldShow =
      isSupported && permission === 'default' && !dismissed

    setIsVisible(shouldShow)
  }, [isSupported, permission])

  const handleActivate = async () => {
    setIsLoading(true)

    try {
      await subscribeToPush()
      setIsVisible(false)
      localStorage.setItem('notification-banner-dismissed', 'true')
    } catch (error) {
      console.error('Error activating notifications:', error)
      alert('Impossibile attivare le notifiche. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('notification-banner-dismissed', 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="mx-4 mt-4 p-4 rounded-xl shadow-sm"
      style={{
        backgroundColor: 'var(--color-background-card)',
        border: '1px solid var(--color-separator)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Bell size={20} color="white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">
            Attiva le notifiche
          </h3>
          <p
            className="text-xs mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Ricevi alert sulle scadenze dei tuoi impegni
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleActivate}
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isLoading ? 'Attivazione...' : 'Attiva'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="py-2 px-4 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-background-section)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Non ora
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          disabled={isLoading}
          className="flex-shrink-0 p-1 -mr-1 -mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
