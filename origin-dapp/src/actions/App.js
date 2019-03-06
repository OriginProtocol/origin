import moment from 'moment-timezone'
import store from 'store'

import keyMirror from 'utils/keyMirror'
import {
  addLocales,
  getAvailableLanguages,
  setGlobalIntlProvider,
  getLanguageNativeName,
  getBestAvailableLanguage
} from 'utils/translationUtils'

import translations from '../../translations/translated-messages.json'

export const AppConstants = keyMirror(
  {
    BETA_MODAL_DISMISSED: null,
    MESSAGING_DISMISSED: null,
    NOTIFICATIONS_DISMISSED: null,
    ON_MOBILE: null,
    SHOW_MAIN_NAV: null,
    SHOW_WELCOME: null,
    TRANSLATIONS: null,
    WEB3_INTENT: null,
    WEB3_NETWORK: null
  },
  'APP'
)

export function dismissBetaModal() {
  return {
    type: AppConstants.BETA_MODAL_DISMISSED,
    closedAt: new Date()
  }
}

export function openBetaModal() {
  return {
    type: AppConstants.BETA_MODAL_DISMISSED,
    closedAt: false
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
