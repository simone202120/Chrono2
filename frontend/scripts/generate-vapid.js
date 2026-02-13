#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push notifications
 * Run: node scripts/generate-vapid.js
 *
 * Output VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
 * Add these to .env.local (frontend) and Supabase Edge Function secrets
 */

import webpush from 'web-push'

console.log('\n🔑 Generating VAPID keys for Web Push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ VAPID keys generated successfully!\n')
console.log('Add these to your .env.local file:\n')
console.log('# Web Push VAPID Keys')
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('\nAlso add to Supabase Edge Function secrets:')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('VAPID_SUBJECT=mailto:your-email@example.com')
console.log('\n')
