importScripts('swAnalytics.js');

self.addEventListener('push', event => {
  const { account, body, offerId, title } = event.data.json()
  const promiseChain = self.registration.showNotification(title, {
    body,
    data: { account, offerId },
    icon: '/images/app-icon.png',
    lang: 'en-US',
    requireInteraction: true,
    vibrate: [300, 100, 400]
  })

  analytics.event('Notifications', 'NotificationPush', title)
  event.waitUntil(promiseChain)
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const { account, offerId } = event.notification.data
  const purchaseDetailPath = `/#/purchases/${offerId}?account=${account}`
  const urlToOpen = new URL(purchaseDetailPath, self.location.origin).href

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null
    analytics.event('Notifications', 'Notification', event.notification.title)

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i]

      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient

        break
      }
    }

    if (matchingClient) {
      analytics.event('Notifications', 'NotificationClickToFocus', event.notification.title)
      return matchingClient.focus()
    } else {
      analytics.event('Notifications', 'NotificationClickToOpen', event.notification.title)
      return clients.openWindow(urlToOpen)
    }
  })

  event.waitUntil(promiseChain)
})

self.addEventListener('notificationclose', event => {
  analytics.event('Notifications', 'NotificationClosed', event.notification.title)
})
self.addEventListener('notificationshow', event => {
  analytics.event('Notifications', 'NotificationShow', event.notification.title)
})
self.addEventListener('notificationerror', event => {
  analytics.event('Notifications', 'NotificationError', event.notification.title)
})

self.addEventListener('message', event => {
  // console.log("🎡", event.data)
  if (event.data && event.data.type == "GA") {
    const trackingID = event.data.value
    analytics.setTrackingId(trackingID)
    // console.log("🎡 Tracking Id set to", trackingID)
    return
  }
})