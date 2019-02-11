import { AppConstants } from 'actions/App'

const initialState = {
  betaModalDismissed: true,
  // a timestamp for when the messages dropdown was last closed
  messagingDismissed: null,
  messagingRequired: process.env.MESSAGING_ACCOUNT,
  mobileDevice: null,
  // a list of ids that were present last time the notifications dropdown was closed
  notificationsDismissed: [],
  showNav: true,
  showWelcome: true,
  translations: {
    selectedLanguageCode: null,
    selectedLanguageFull: null,
    availableLanguages: null,
    messages: null
  },
  web3: {
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

  case AppConstants.NOTIFICATIONS_DISMISSED:
    return { ...state, notificationsDismissed: action.ids }

  case AppConstants.ON_MOBILE:
    return { ...state, mobileDevice: action.device }

  case AppConstants.SHOW_MAIN_NAV:
    return { ...state, showNav: action.showNav }

  case AppConstants.SHOW_WELCOME:
    return { ...state, showWelcome: action.showWelcome }

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

  case AppConstants.WEB3_INTENT:
    return { ...state, web3: { ...state.web3, intent: action.intent } }

  case AppConstants.WEB3_NETWORK:
    return { ...state, web3: { ...state.web3, networkId: action.networkId } }

  default:
    return state
  }
}
