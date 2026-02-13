import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

const INSTALL_PROMPT_KEY = 'install-prompt-dismissed'
const INSTALL_PROMPT_DELAY = 3 // Show after 3 days of usage

/**
 * InstallPrompt - PWA installation banner
 * - Shows after user has used app for a few days
 * - Can be dismissed permanently
 * - iOS-styled design
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall, dismissPrompt } =
    useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled) {
      return
    }

    // Don't show if not installable
    if (!isInstallable) {
      return
    }

    // Check if user dismissed the prompt
    const dismissed = localStorage.getItem(INSTALL_PROMPT_KEY)
    if (dismissed) {
      return
    }

    // Check if user has used app for enough days
    const firstVisit = localStorage.getItem('first-visit')
    if (!firstVisit) {
      localStorage.setItem('first-visit', new Date().toISOString())
      return
    }

    const daysSinceFirstVisit =
      (Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceFirstVisit >= INSTALL_PROMPT_DELAY) {
      setIsVisible(true)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    try {
      await promptInstall()
      setIsVisible(false)
      localStorage.setItem(INSTALL_PROMPT_KEY, 'true')
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    dismissPrompt()
    localStorage.setItem(INSTALL_PROMPT_KEY, 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="mx-4 mb-4 p-4 rounded-xl shadow-lg"
      style={{
        backgroundColor: 'var(--color-background-card)',
        border: '1px solid var(--color-separator)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-success)' }}
        >
          <Download size={20} color="white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">
            Installa Agile Planner
          </h3>
          <p
            className="text-xs mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Installa l'app per un accesso più rapido e un'esperienza migliore
          </p>

          {/* Action */}
          <button
            onClick={handleInstall}
            className="w-full py-2 px-4 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            Installa
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 -mr-1 -mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
