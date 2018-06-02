import keyMirror from '../utils/keyMirror'
import addLocales from '../utils/addLocales'
import translations from '../../translations/translated-messages.json'

export const AppConstants = keyMirror(
  {
    ON_MOBILE: null,
    WEB3_ACCOUNT: null,
    WEB3_INTENT: null,
    TRANSLATIONS: null,
  },
  'APP'
)

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
  // Add locale data to react-intl
  addLocales()

  // Detect user's preferred settings
  const detectedLanguage = (navigator.languages && navigator.languages[0]) ||
                           navigator.language ||
                           navigator.userLanguage

  // Split locales with a region code
  // const languageWithoutRegionCode = detectedLanguage.toLowerCase().split(/[_-]+/)[0]
  const languageWithoutRegionCode = 'zh'

  // English is our default - to prevent errors, we set to undefined for English
  // https://github.com/yahoo/react-intl/issues/619#issuecomment-242765427
  // Try full locale, try locale without region code, fallback to 'en'
  let messages;
  if (languageWithoutRegionCode !== 'en') {
    messages = translations[languageWithoutRegionCode] || translations[detectedLanguage]
  }

  return { type: AppConstants.TRANSLATIONS, languageWithoutRegionCode, messages }
}
