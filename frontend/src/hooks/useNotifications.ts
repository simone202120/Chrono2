import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface UseNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  requestPermission: () => Promise<boolean>
  subscribeToPush: () => Promise<void>
  unsubscribeFromPush: () => Promise<void>
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Hook for managing Web Push notifications
 * - Checks browser support
 * - Requests notification permission
 * - Manages push subscription
 * - Saves subscription to Supabase
 */
export function useNotifications(): UseNotificationsReturn {
  const user = useAuthStore(state => state.user)
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Check if notifications are supported
  useEffect(() => {
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window

    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  /**
   * Check if user is already subscribed to push notifications
   */
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
      setIsSubscribed(false)
    }
  }

  /**
   * Request notification permission from user
   * @returns True if permission granted, false otherwise
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.error('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   * Creates PushSubscription and saves it to Supabase
   */
  const subscribeToPush = async (): Promise<void> => {
    if (!isSupported || !user) {
      throw new Error('Notifications not supported or user not authenticated')
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key not configured')
    }

    try {
      // Request permission if not already granted
      if (permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          throw new Error('Notification permission denied')
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Subscribe to push notifications
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        })
      }

      // Save subscription to Supabase
      const subscriptionData = subscription.toJSON()

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: subscriptionData.keys,
        },
        {
          onConflict: 'endpoint',
        }
      )

      if (error) throw error

      setIsSubscribed(true)
      console.log('✅ Push subscription saved')
    } catch (error) {
      console.error('Error subscribing to push:', error)
      throw error
    }
  }

  /**
   * Unsubscribe from push notifications
   * Removes subscription from browser and Supabase
   */
  const unsubscribeFromPush = async (): Promise<void> => {
    if (!isSupported || !user) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe()

        // Remove from Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)

        if (error) throw error

        setIsSubscribed(false)
        console.log('✅ Push subscription removed')
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      throw error
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 * Required by PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
