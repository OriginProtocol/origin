import analytics from '../services/analytics'

const vapidKey = process.env.NOTIFICATIONS_KEY

// convert key for use in subscription
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export const createSubscription = (registration, account) => {
  return new Promise(async (resolve, reject) => {
    let stage
    try {
      stage = 'browserSubscription'
      const subscription = await registration.pushManager.subscribe({
        // currently required to avoid silent push
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })
      // beware: subscription has a toJson method defined
      const body = JSON.stringify({
        ...JSON.parse(JSON.stringify(subscription)),
        account
      })
      stage = 'notificationServerSubscription'
      await fetch(process.env.NOTIFICATIONS_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      })
      analytics.event('Notifications', 'CreateSubscription')
      resolve(subscription)
    } catch (error) {
      // TODO, when fetch fails, we never reach here
      console.error('Failure subscribing to push notifications')
      console.log(error)
      analytics.event('Notifications', 'ErrorCreateSubscription', stage)
      reject(error)
    }
  })
}

// Register service worker if possible and return it
export const initServiceWorker = () => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      analytics.event('Notifications', 'NoServiceWorker')
      reject('Browser does not support server workers')
    }

    if (!('PushManager' in window)) {
      analytics.event('Notifications', 'NoPushManager')
      reject('Browser does not support push functionality')
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        analytics.event('Notifications', 'ServiceWorkerRegistered', 'sw.js')
        console.log('Notifications service worker registered')
        navigator.serviceWorker.controller.postMessage(
          { type: 'GA', value: analytics.gaTrackingId }
        )
        resolve(registration)
      })
      .catch(err => {
        reject(err)
      })
  })
}

// Must support both callback (deprecated) and promise-based API
export const requestPermission = () => {
  return new Promise((resolve, reject) => {
    const permission = Notification.requestPermission(result => {
      resolve(result)
    })

    if (permission) {
      permission.then(resolve, reject)
    }
  }).then(permission => {
    /*
     * Possible permissions (Chome / Firefox):
     * - 'default': prompt dismissed / Not Now
     * - 'denied': Block / Never Allow
     * - 'granted': Allow / Allow Notifications
     */
    if (permission !== 'granted') {
      throw new Error(`Notifications permission not granted: ${permission}`)
    }

    return permission
  })
}
