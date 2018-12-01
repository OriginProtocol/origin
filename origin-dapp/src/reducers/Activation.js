import { ActivationConstants } from 'actions/Activation'

const initialState = {
  messaging: {
    // whether or not a public key has been added to the global registry
    enabled: false,
    // whether or not the global keys have loaded
    initialized: false,
  },
  notifications: {
    permissions: {
      // get existing permission state if feature detected
      hard: 'Notification' in window ? Notification.permission : undefined,
      // initial reponses before submitting native request
      soft: localStorage.getItem('notificationsPermissionResponse')
    },
    pushEnabled: !!(process.env.NOTIFICATIONS_KEY && process.env.NOTIFICATIONS_URL),
    serviceWorkerRegistration: null,
    // which soft permission request prompt to display: buyer, seller, warning
    subscriptionPrompt: null
  }
}

export default function Activation(state = initialState, action = {}) {
  switch (action.type) {

  case ActivationConstants.MESSAGING_ENABLED:
    return {
      ...state,
      messaging: {
        ...state.messaging,
        enabled: action.enabled
      }
    }

  case ActivationConstants.MESSAGING_INITIALIZED:
    return {
      ...state,
      messaging: {
        ...state.messaging,
        initialized: action.initialized
      }
    }

  case ActivationConstants.NOTIFICATIONS_HARD_PERMISSION:
    return {
      ...state,
      notifications: {
        ...state.notifications,
        permissions: {
          ...state.notifications.permissions,
          hard: action.result
        }
      }
    }

  case ActivationConstants.NOTIFICATIONS_SOFT_PERMISSION:
    return {
      ...state,
      notifications: {
        ...state.notifications,
        permissions: {
          ...state.notifications.permissions,
          soft: action.result
        }
      }
    }

  case ActivationConstants.NOTIFICATIONS_SUBSCRIPTION_PROMPT:
    return {
      ...state,
      notifications: {
        ...state.notifications,
        subscriptionPrompt: action.role
      }
    }

  case ActivationConstants.SERVICE_WORKER_REGISTRATION:
    return {
      ...state,
      notifications: {
        ...state.notifications,
        serviceWorkerRegistration: action.registration
      }
    }

  default:
    return state
  }
}
