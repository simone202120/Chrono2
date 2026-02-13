import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface Task {
  id: string
  user_id: string
  title: string
  due_date: string
  status: string
}

/**
 * Supabase Edge Function: notify-due-tasks
 * Runs every hour via cron
 * Sends push notifications for tasks due today or tomorrow
 */
serve(async (req: Request) => {
  try {
    console.log('🔔 Starting notify-due-tasks function...')

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get current date and tomorrow's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    console.log(`📅 Checking tasks due on ${todayStr} or ${tomorrowStr}`)

    // Query tasks due today or tomorrow (not completed or postponed)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, user_id, title, due_date, status')
      .in('due_date', [todayStr, tomorrowStr])
      .not('status', 'in', '("done","postponed")')

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError)
      throw tasksError
    }

    console.log(`📋 Found ${tasks?.length || 0} tasks due`)

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No tasks due today or tomorrow',
          count: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Group tasks by user
    const tasksByUser = tasks.reduce((acc, task) => {
      if (!acc[task.user_id]) {
        acc[task.user_id] = []
      }
      acc[task.user_id].push(task as Task)
      return acc
    }, {} as Record<string, Task[]>)

    console.log(`👥 Grouped tasks for ${Object.keys(tasksByUser).length} users`)

    let notificationsSent = 0
    let notificationsFailed = 0

    // Send notifications for each user
    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      try {
        // Get user's push subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId)

        if (subsError) {
          console.error(`❌ Error fetching subscriptions for user ${userId}:`, subsError)
          continue
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.log(`⚠️  No push subscriptions for user ${userId}`)
          continue
        }

        // Send notification to each subscription
        for (const subscription of subscriptions as PushSubscription[]) {
          try {
            // Prepare notification payload
            const task = userTasks[0] // First task
            const isToday = task.due_date === todayStr
            const title = isToday
              ? `Scadenza oggi: ${task.title}`
              : `Scadenza domani: ${task.title}`
            const body =
              userTasks.length > 1
                ? `+${userTasks.length - 1} altri impegni in scadenza`
                : 'Apri l\'app per vedere i dettagli'

            const payload = {
              title,
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              data: {
                taskId: task.id,
                url: '/',
              },
            }

            // Send push notification using web-push protocol
            await sendPushNotification(
              subscription.endpoint,
              subscription.keys,
              payload
            )

            notificationsSent++
            console.log(`✅ Notification sent to user ${userId}`)
          } catch (error) {
            console.error(`❌ Failed to send to ${subscription.endpoint}:`, error)
            notificationsFailed++

            // If subscription is expired or invalid, remove it
            if (
              error instanceof Error &&
              (error.message.includes('410') || error.message.includes('404'))
            ) {
              console.log(`🗑️  Removing expired subscription ${subscription.id}`)
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', subscription.id)
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error)
        notificationsFailed++
      }
    }

    console.log(`✅ Notifications sent: ${notificationsSent}`)
    console.log(`❌ Notifications failed: ${notificationsFailed}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications processed',
        sent: notificationsSent,
        failed: notificationsFailed,
        tasksChecked: tasks.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ Error in notify-due-tasks:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Send push notification using Web Push protocol
 * Implements VAPID authentication and encryption
 */
async function sendPushNotification(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  payload: unknown
): Promise<void> {
  // Import web-push library for Deno
  const webPush = await import('https://esm.sh/web-push@3.6.6')

  // Set VAPID details
  webPush.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  // Create subscription object
  const subscription = {
    endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  }

  // Send notification
  await webPush.default.sendNotification(subscription, JSON.stringify(payload))
}
