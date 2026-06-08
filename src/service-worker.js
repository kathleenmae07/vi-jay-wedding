import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(self.clients.claim())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Wedding HQ', body: 'Your planning reminder is ready.' }
  const title = data.title || 'Wedding HQ Reminder'
  const options = {
    body: data.body || 'Tap to open your wedding planning dashboard.',
    icon: '/jv-logo.png',
    badge: '/jv-logo.png',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
