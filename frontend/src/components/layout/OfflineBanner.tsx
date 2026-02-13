import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * OfflineBanner - Shows when app is offline
 * Displays at the top of the app with warning color
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div
      className="flex items-center justify-center gap-2 py-2 px-4"
      style={{
        backgroundColor: 'var(--color-warning)',
        color: 'white',
      }}
    >
      <WifiOff size={16} />
      <span className="text-sm font-medium">
        Sei offline. Alcune funzioni non sono disponibili.
      </span>
    </div>
  )
}
