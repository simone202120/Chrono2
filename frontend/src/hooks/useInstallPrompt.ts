import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface UseInstallPromptReturn {
  isInstallable: boolean
  isInstalled: boolean
  promptInstall: () => Promise<void>
  dismissPrompt: () => void
}

/**
 * Hook to manage PWA install prompt
 * - Captures beforeinstallprompt event
 * - Provides method to show install prompt
 * - Tracks installation status
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // iOS/Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }

      // Android/Chrome
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }

      // Desktop
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true)
        return
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      console.log('📲 PWA install prompt available')
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed')
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * Show the install prompt to user
   */
  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️  Install prompt not available')
      return
    }

    // Show the prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice
    console.log(`👤 User response: ${outcome}`)

    // Clear the deferred prompt
    setDeferredPrompt(null)
  }

  /**
   * Dismiss the prompt (user chose "not now")
   */
  const dismissPrompt = () => {
    setDeferredPrompt(null)
  }

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    promptInstall,
    dismissPrompt,
  }
}
