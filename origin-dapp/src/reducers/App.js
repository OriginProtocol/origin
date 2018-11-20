import { AppConstants } from 'actions/App'

const initialState = {
  betaModalDismissed: false,
  // a timestamp for when the messages dropdown was last closed
  messagingDismissed: null,
  // whether or not a public key has been added to the global registry
  messagingEnabled: false,
  // whether or not the global keys have loaded
  messagingInitialized: false,
  mobileDevice: null,
  showNav: true,
  // a list of ids that were present last time the notifications dropdown was closed
  notificationsDismissed: [],
  // get existing permission state if feature detected
  notificationsHardPermission: 'Notification' in window ? Notification.permission : undefined,
  // initial reponses before submitting native request
  notificationsSoftPermission: localStorage.getItem('notificationsPermissionResponse'),
  // which soft permission request prompt to display: buyer, seller, warning
  notificationsSubscriptionPrompt: null,
  pushNotificationsSupported: !!(process.env.NOTIFICATIONS_KEY && process.env.NOTIFICATIONS_URL),
  serviceWorkerRegistration: null,
  translations: {
    selectedLanguageCode: null,
    selectedLanguageFull: null,
    availableLanguages: null,
    messages: null
  },
  web3: {
    account: null,
    intent: null,
    networkId: null
  }
}

export default function App(state = initialState, action = {}) {
  switch (action.type) {
  case AppConstants.BETA_MODAL_DISMISSED:
    return { ...state, betaModalDismissed: action.closedAt }

  case AppConstants.MESSAGING_DISMISSED:
    return { ...state, messagingDismissed: action.closedAt }

  case AppConstants.MESSAGING_ENABLED:
    return { ...state, messagingEnabled: action.messagingEnabled }

  case AppConstants.MESSAGING_INITIALIZED:
    return { ...state, messagingInitialized: action.messagingInitialized }

  case AppConstants.NOTIFICATIONS_DISMISSED:
    return { ...state, notificationsDismissed: action.ids }

  case AppConstants.NOTIFICATIONS_HARD_PERMISSION:
    return { ...state, notificationsHardPermission: action.result }

  case AppConstants.NOTIFICATIONS_SOFT_PERMISSION:
    return { ...state, notificationsSoftPermission: action.result }

  case AppConstants.NOTIFICATIONS_SUBSCRIPTION_PROMPT:
    return { ...state, notificationsSubscriptionPrompt: action.role }

  case AppConstants.ON_MOBILE:
    return { ...state, mobileDevice: action.device }

  case AppConstants.SHOW_MAIN_NAV:
    return { ...state, showNav: action.showNav }

  case AppConstants.SAVE_SERVICE_WORKER_REGISTRATION:
    return { ...state, serviceWorkerRegistration: action.registration }

  case AppConstants.TRANSLATIONS:
    return {
      ...state,
      translations: {
        selectedLanguageCode: action.selectedLanguageCode,
        selectedLanguageFull: action.selectedLanguageFull,
        availableLanguages: action.availableLanguages,
        messages: action.messages
      }
    }

  case AppConstants.WEB3_ACCOUNT:
    return { ...state, web3: { ...state.web3, account: action.address } }

  case AppConstants.WEB3_INTENT:
    return { ...state, web3: { ...state.web3, intent: action.intent } }

  case AppConstants.WEB3_NETWORK:
    return { ...state, web3: { ...state.web3, networkId: action.networkId } }

  default:
    return state
  }
}
