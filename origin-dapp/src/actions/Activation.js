import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'
import { createSubscription } from 'utils/notifications'

import origin from '../services/origin'

export const ActivationConstants = keyMirror(
  {
    MESSAGING_ENABLED: null,
    MESSAGING_INITIALIZED: null,
    NOTIFICATIONS_HARD_PERMISSION: null,
    NOTIFICATIONS_SOFT_PERMISSION: null,
    NOTIFICATIONS_SUBSCRIPTION_PROMPT: null,
    SERVICE_WORKER_REGISTRATION: null
  },
  'ACTIVATION'
)

export function detectMessagingEnabled(account) {
  return async function(dispatch) {
    try {
      const clientResponse = origin.messaging.getMessagingKey()

      if (!clientResponse) {
        return dispatch({
          type: ActivationConstants.MESSAGING_ENABLED,
          enabled: false
        })
      }

      const enabled = await origin.messaging.canReceiveMessages(account)
      dispatch({
        type: ActivationConstants.MESSAGING_ENABLED,
        enabled
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export function handleNotificationsSubscription(role, props = {}) {
  return async function(dispatch) {
    const {
      notificationsHardPermission,
      notificationsSoftPermission,
      pushNotificationsSupported,
      serviceWorkerRegistration,
      wallet
    } = props

    if (!pushNotificationsSupported) {
      return
    }

    if (notificationsHardPermission === 'default') {
      if ([null, 'warning'].includes(notificationsSoftPermission)) {
        dispatch(handleNotificationsSubscriptionPrompt(role))
      }
    // existing subscription may need to be replicated for current account
    } else if (notificationsHardPermission === 'granted') {
      createSubscription(serviceWorkerRegistration, wallet.address)
    }
  }
}

export function handleNotificationsSubscriptionPrompt(role) {
  return {
    type: ActivationConstants.NOTIFICATIONS_SUBSCRIPTION_PROMPT,
    role
  }
}

export function setNotificationsHardPermission(result) {
  return {
    type: ActivationConstants.NOTIFICATIONS_HARD_PERMISSION,
    result
  }
}

export function setNotificationsSoftPermission(result) {
  localStorage.setItem('notificationsPermissionResponse', result)

  return {
    type: ActivationConstants.NOTIFICATIONS_SOFT_PERMISSION,
    result
  }
}

export function enableMessaging() {
  return function(dispatch) {
    try {
      origin.messaging.startConversing()
    } catch (error) {
      dispatch(showAlert(error.message))
    }
  }
}

export function setMessagingEnabled(enabled) {
  return {
    type: ActivationConstants.MESSAGING_ENABLED,
    enabled
  }
}

export function setMessagingInitialized(initialized) {
  return {
    type: ActivationConstants.MESSAGING_INITIALIZED,
    initialized
  }
}

export function saveServiceWorkerRegistration(registration) {
  return {
    type: ActivationConstants.SERVICE_WORKER_REGISTRATION,
    registration
  }
}
