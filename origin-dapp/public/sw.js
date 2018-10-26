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

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i]

      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient

        break
      }
    }

    if (matchingClient) {
      return matchingClient.focus()
    } else {
      return clients.openWindow(urlToOpen)
    }
  })

  event.waitUntil(promiseChain)
})

self.addEventListener('notificationclose', event => {
  // track dismissal
})
