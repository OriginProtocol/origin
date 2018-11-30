import moment from 'moment'
import store from 'store'

import { unblock } from 'actions/Onboarding'
import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'
import { createSubscription } from 'utils/notifications'
import {
  addLocales,
  getAvailableLanguages,
  setGlobalIntlProvider,
  getLanguageNativeName,
  getBestAvailableLanguage
} from 'utils/translationUtils'

import origin from '../services/origin'

import translations from '../../translations/translated-messages.json'

export const AppConstants = keyMirror(
  {
    BETA_MODAL_DISMISSED: null,
    MESSAGING_DISMISSED: null,
    MESSAGING_ENABLED: null,
    MESSAGING_INITIALIZED: null,
    NOTIFICATIONS_DISMISSED: null,
    NOTIFICATIONS_HARD_PERMISSION: null,
    NOTIFICATIONS_SOFT_PERMISSION: null,
    NOTIFICATIONS_SUBSCRIPTION_PROMPT: null,
    ON_MOBILE: null,
    SHOW_MAIN_NAV: null,
    SHOW_WELCOME: null,
    SAVE_SERVICE_WORKER_REGISTRATION: null,
    TRANSLATIONS: null,
    WEB3_ACCOUNT: null,
    WEB3_INTENT: null,
    WEB3_NETWORK: null
  },
  'APP'
)

export function dismissBetaModal() {
  return async function(dispatch) {
    dispatch({
      type: AppConstants.BETA_MODAL_DISMISSED,
      closedAt: new Date()
    })

    /*
     * this delay should be moved to the onboarding modal animation
     * and not depend on a prerequisite beta modal
    */
    setTimeout(() => {
      dispatch(unblock())
    }, 1000)
  }
}

export function dismissMessaging() {
  return {
    type: AppConstants.MESSAGING_DISMISSED,
    closedAt: new Date()
  }
}

export function dismissNotifications(ids) {
  return {
    type: AppConstants.NOTIFICATIONS_DISMISSED,
    ids
  }
}

export function handleNotificationsSubscription(role, props = {}) {
  return async function(dispatch) {
    const {
      notificationsHardPermission,
      notificationsSoftPermission,
      pushNotificationsSupported,
      serviceWorkerRegistration,
      web3Account
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
      createSubscription(serviceWorkerRegistration, web3Account)
    }
  }
}

export function handleNotificationsSubscriptionPrompt(role) {
  return {
    type: AppConstants.NOTIFICATIONS_SUBSCRIPTION_PROMPT,
    role
  }
}

export function setNotificationsHardPermission(result) {
  return {
    type: AppConstants.NOTIFICATIONS_HARD_PERMISSION,
    result
  }
}

export function setNotificationsSoftPermission(result) {
  localStorage.setItem('notificationsPermissionResponse', result)

  return {
    type: AppConstants.NOTIFICATIONS_SOFT_PERMISSION,
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

export function setMessagingEnabled(messagingEnabled) {
  return {
    type: AppConstants.MESSAGING_ENABLED,
    messagingEnabled
  }
}

export function setMessagingInitialized(messagingInitialized) {
  return {
    type: AppConstants.MESSAGING_INITIALIZED,
    messagingInitialized
  }
}

export function setMobile(device) {
  return { type: AppConstants.ON_MOBILE, device }
}

export function showMainNav(showNav) {
  return { type: AppConstants.SHOW_MAIN_NAV, showNav }
}

export function showWelcomeWarning(showWelcome) {
  return { type: AppConstants.SHOW_WELCOME, showWelcome }
}

export function storeNetwork(networkId) {
  return { type: AppConstants.WEB3_NETWORK, networkId }
}

export function storeWeb3Account(address) {
  return { type: AppConstants.WEB3_ACCOUNT, address }
}

export function storeWeb3Intent(intent) {
  return { type: AppConstants.WEB3_INTENT, intent }
}

export function localizeApp() {
  let bestAvailableLanguage

  // Add locale data to react-intl
  addLocales()

  // English is our default - to prevent errors, we set to undefined for English
  // https://github.com/yahoo/react-intl/issues/619#issuecomment-242765427
  // Check for a user-selected language from the dropdown menu (stored in local storage)
  const userSelectedLangCode = store.get('preferredLang')

  // English is our default - to prevent errors, we set to undefined for English
  if (userSelectedLangCode && userSelectedLangCode !== 'en-US') {
    bestAvailableLanguage = getBestAvailableLanguage(userSelectedLangCode)
  } else {
    // Detect user's preferred settings
    const browserDefaultLang =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage
    if (browserDefaultLang) {
      bestAvailableLanguage = getBestAvailableLanguage(browserDefaultLang)
    }
  }

  const messages = translations[bestAvailableLanguage]
  if (messages && messages['header.title']) {
    document.title = messages['header.title']
  }
  let selectedLanguageCode = bestAvailableLanguage

  if (!selectedLanguageCode || !messages) {
    selectedLanguageCode = 'en-US'
  }

  setGlobalIntlProvider(selectedLanguageCode, messages)

  // Set locale for moment.js
  if (selectedLanguageCode !== 'en-US') {
    const momentLocale = selectedLanguageCode
    moment.locale(momentLocale)
  }

  return {
    type: AppConstants.TRANSLATIONS,
    selectedLanguageCode: selectedLanguageCode,
    selectedLanguageFull: getLanguageNativeName(selectedLanguageCode),
    availableLanguages: getAvailableLanguages(),
    messages
  }
}

export function saveServiceWorkerRegistration(registration) {
  return {
    type: AppConstants.SAVE_SERVICE_WORKER_REGISTRATION,
    registration
  }
}
