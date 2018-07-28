import { AppConstants } from 'actions/App'

const initialState = {
  // a timestamp for when the messages dropdown was last closed
  messagingDismissed: null,
  // whether or not a public key has been added to the global registry
  messagingEnabled: false,
  // a list of ids that were present last time the notifications dropdown was closed
  notificationsDismissed: [],
  onMobile: null,
  web3: {
    account: null,
    intent: null,
  },
  translations: {
    selectedLanguageAbbrev: null,
    selectedLanguageFull: null,
    availableLanguages: null,
    messages: null
  }
}

export default function App(state = initialState, action = {}) {
  switch (action.type) {

    case AppConstants.MESSAGING_DISMISSED:
      return { ...state, messagingDismissed: action.closedAt }

    case AppConstants.MESSAGING_ENABLED:
      return { ...state, messagingEnabled: action.messagingEnabled }

    case AppConstants.NOTIFICATIONS_DISMISSED:
      return { ...state, notificationsDismissed: action.ids }

    case AppConstants.ON_MOBILE:
      return { ...state, onMobile: action.device }

    case AppConstants.WEB3_ACCOUNT:
      return { ...state, web3: { ...state.web3, account: action.address }}

    case AppConstants.WEB3_INTENT:
      return { ...state, web3: { ...state.web3, intent: action.intent }}

    case AppConstants.TRANSLATIONS:
      return { 
        ...state, 
        translations: { 
          selectedLanguageAbbrev: action.selectedLanguageAbbrev, 
          selectedLanguageFull: action.selectedLanguageFull,
          availableLanguages: action.availableLanguages,
          messages: action.messages 
        }
      }

    default:
      return state
  }
}
