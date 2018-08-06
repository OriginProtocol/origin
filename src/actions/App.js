import moment from 'moment'
import store from 'store'

import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'
import {
  addLocales,
  getAvailableLanguages,
  setGlobalIntlProvider,
  getLanguageNativeName
} from 'utils/translationUtils'

import origin from '../services/origin'

import translations from '../../translations/translated-messages.json'

export const AppConstants = keyMirror(
  {
    MESSAGING_DISMISSED: null,
    MESSAGING_ENABLED: null,
    NOTIFICATIONS_DISMISSED: null,
    ON_MOBILE: null,
    WEB3_ACCOUNT: null,
    WEB3_INTENT: null,
    TRANSLATIONS: null,
  },
  'APP'
)

export function dismissMessaging() {
  return {
    type: AppConstants.MESSAGING_DISMISSED,
    closedAt: new Date(),
  }
}

export function dismissNotifications(ids) {
  return {
    type: AppConstants.NOTIFICATIONS_DISMISSED,
    ids,
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

export function setMobile(device) {
  return { type: AppConstants.ON_MOBILE, device }
}

export function storeWeb3Account(address) {
  return { type: AppConstants.WEB3_ACCOUNT, address }
}

export function storeWeb3Intent(intent) {
  return { type: AppConstants.WEB3_INTENT, intent }
}

export function localizeApp() {
  let messages
  let selectedLanguageAbbrev

  // Add locale data to react-intl
  addLocales()

  // English is our default - to prevent errors, we set to undefined for English
  // https://github.com/yahoo/react-intl/issues/619#issuecomment-242765427
  // Check for a user-selected language from the dropdown menu (stored in local storage)
  const userSelectedLangAbbrev = store.get('preferredLang')

  // English is our default - to prevent errors, we set to undefined for English
  if (userSelectedLangAbbrev && userSelectedLangAbbrev !== 'en-US') {

    messages = translations[userSelectedLangAbbrev]
    selectedLanguageAbbrev = userSelectedLangAbbrev

  } else {

    // Detect user's preferred settings
    const browserDefaultLang = (navigator.languages && navigator.languages[0]) ||
                             navigator.language ||
                             navigator.userLanguage

    if (browserDefaultLang && browserDefaultLang !== 'en-US') {
      messages = translations[selectedLanguageAbbrev] || translations[selectedLanguageAbbrev]
      selectedLanguageAbbrev = browserDefaultLang
    }
  }

  if (!selectedLanguageAbbrev) {
    selectedLanguageAbbrev = 'en-US'
  }

  setGlobalIntlProvider(selectedLanguageAbbrev, messages)

  // Set locale for moment.js
  if (selectedLanguageAbbrev !== 'en-US') {
    const momentLocale = selectedLanguageAbbrev
    moment.locale(momentLocale)
  }

  return { 
    type: AppConstants.TRANSLATIONS,
    selectedLanguageAbbrev: selectedLanguageAbbrev,
    selectedLanguageFull: getLanguageNativeName(selectedLanguageAbbrev),
    availableLanguages: getAvailableLanguages(),
    messages 
  }
}
