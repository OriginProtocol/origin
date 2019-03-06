import { addLocaleData, IntlProvider } from 'react-intl'
import translations from '../../translations/translated-messages.json'
import ar from 'react-intl/locale-data/ar'
import bn from 'react-intl/locale-data/bn'
import bs from 'react-intl/locale-data/bs'
import cs from 'react-intl/locale-data/cs'
import da from 'react-intl/locale-data/da'
import de from 'react-intl/locale-data/de'
import el from 'react-intl/locale-data/el'
import en from 'react-intl/locale-data/en'
import eo from 'react-intl/locale-data/eo'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import fil from 'react-intl/locale-data/fil'
import he from 'react-intl/locale-data/he'
import hr from 'react-intl/locale-data/hr'
import id from 'react-intl/locale-data/id'
import it from 'react-intl/locale-data/it'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import lo from 'react-intl/locale-data/lo'
import ms from 'react-intl/locale-data/ms'
import nl from 'react-intl/locale-data/nl'
import pt from 'react-intl/locale-data/pt'
import pl from 'react-intl/locale-data/pl'
import ro from 'react-intl/locale-data/ro'
import ru from 'react-intl/locale-data/ru'
import si from 'react-intl/locale-data/si'
import sr from 'react-intl/locale-data/sr'
import sk from 'react-intl/locale-data/sk'
import te from 'react-intl/locale-data/te'
import th from 'react-intl/locale-data/th'
import tr from 'react-intl/locale-data/tr'
import ug from 'react-intl/locale-data/ug'
import uk from 'react-intl/locale-data/uk'
import ur from 'react-intl/locale-data/ur'
import vi from 'react-intl/locale-data/vi'
import zh from 'react-intl/locale-data/zh'
import schemaMessages from '../schemaMessages/index'
import localeCode from 'locale-code'

let globalIntlProvider

export function addLocales() {
  // If browser doesn't support Intl (i.e. Safari), then we manually import
  // the intl polyfill and locale data.
  if (!window.Intl) {
    require.ensure(
      [
        'intl',
        'intl/locale-data/jsonp/ar.js',
        'intl/locale-data/jsonp/bn.js',
        'intl/locale-data/jsonp/bs.js',
        'intl/locale-data/jsonp/cs.js',
        'intl/locale-data/jsonp/da.js',
        'intl/locale-data/jsonp/de.js',
        'intl/locale-data/jsonp/el.js',
        'intl/locale-data/jsonp/en.js',
        'intl/locale-data/jsonp/eo.js',
        'intl/locale-data/jsonp/es.js',
        'intl/locale-data/jsonp/fil.js',
        'intl/locale-data/jsonp/fr.js',
        'intl/locale-data/jsonp/he.js',
        'intl/locale-data/jsonp/hr.js',
        'intl/locale-data/jsonp/id.js',
        'intl/locale-data/jsonp/it.js',
        'intl/locale-data/jsonp/lo.js',
        'intl/locale-data/jsonp/ja.js',
        'intl/locale-data/jsonp/ko.js',
        'intl/locale-data/jsonp/ms.js',
        'intl/locale-data/jsonp/nl.js',
        'intl/locale-data/jsonp/pl.js',
        'intl/locale-data/jsonp/pt.js',
        'intl/locale-data/jsonp/ro.js',
        'intl/locale-data/jsonp/ru.js',
        'intl/locale-data/jsonp/si.js',
        'intl/locale-data/jsonp/sr.js',
        'intl/locale-data/jsonp/sk.js',
        'intl/locale-data/jsonp/te.js',
        'intl/locale-data/jsonp/th.js',
        'intl/locale-data/jsonp/tr.js',
        'intl/locale-data/jsonp/ug.js',
        'intl/locale-data/jsonp/uk.js',
        'intl/locale-data/jsonp/ur.js',
        'intl/locale-data/jsonp/vi.js',
        'intl/locale-data/jsonp/zh.js'
      ],
      require => {
        require('intl')
        require('intl/locale-data/jsonp/ar.js')
        require('intl/locale-data/jsonp/bn.js')
        require('intl/locale-data/jsonp/bs.js')
        require('intl/locale-data/jsonp/cs.js')
        require('intl/locale-data/jsonp/da.js')
        require('intl/locale-data/jsonp/de.js')
        require('intl/locale-data/jsonp/el.js')
        require('intl/locale-data/jsonp/en.js')
        require('intl/locale-data/jsonp/eo.js')
        require('intl/locale-data/jsonp/es.js')
        require('intl/locale-data/jsonp/fil.js')
        require('intl/locale-data/jsonp/fr.js')
        require('intl/locale-data/jsonp/he.js')
        require('intl/locale-data/jsonp/hr.js')
        require('intl/locale-data/jsonp/id.js')
        require('intl/locale-data/jsonp/it.js')
        require('intl/locale-data/jsonp/lo.js')
        require('intl/locale-data/jsonp/ja.js')
        require('intl/locale-data/jsonp/ko.js')
        require('intl/locale-data/jsonp/ms.js')
        require('intl/locale-data/jsonp/nl.js')
        require('intl/locale-data/jsonp/pl.js')
        require('intl/locale-data/jsonp/pt.js')
        require('intl/locale-data/jsonp/ro.js')
        require('intl/locale-data/jsonp/ru.js')
        require('intl/locale-data/jsonp/si.js')
        require('intl/locale-data/jsonp/sr.js')
        require('intl/locale-data/jsonp/sk.js')
        require('intl/locale-data/jsonp/te.js')
        require('intl/locale-data/jsonp/th.js')
        require('intl/locale-data/jsonp/tr.js')
        require('intl/locale-data/jsonp/ug.js')
        require('intl/locale-data/jsonp/uk.js')
        require('intl/locale-data/jsonp/ur.js')
        require('intl/locale-data/jsonp/vi.js')
        require('intl/locale-data/jsonp/zh.js')
      }
    )
  }

  addLocaleData([
    ...ar,
    ...bn,
    ...bs,
    ...cs,
    ...da,
    ...de,
    ...el,
    ...en,
    ...eo,
    ...es,
    ...fil,
    ...fr,
    ...he,
    ...hr,
    ...id,
    ...it,
    ...lo,
    ...ja,
    ...ko,
    ...ms,
    ...nl,
    ...pl,
    ...pt,
    ...ro,
    ...ru,
    ...si,
    ...sr,
    ...sk,
    ...te,
    ...th,
    ...tr,
    ...ug,
    ...uk,
    ...ur,
    ...vi,
    ...zh
  ])
}

export function getBestAvailableLanguage(langCode) {
  // Fall back to english if no better choice is found
  let toReturn = 'en-US'
  // If we have an exact match for the user's lang code, use it
  if (translations && translations[langCode]) {
    toReturn = langCode
  } else {
    const userBaseLang =
      langCode.indexOf('-') > -1
        ? langCode.substring(0, langCode.indexOf('-'))
        : langCode
    const baseLangMatch = translations[userBaseLang]

    // If we can't match the exact lang code, try to match the base - for example the "zh" in "zh-AA"
    if (baseLangMatch) {
      toReturn = userBaseLang
    } else {
      for (const locale in translations) {
        let localeToCheck
        if (locale.indexOf('-') > -1) {
          localeToCheck = locale.substring(0, locale.indexOf('-'))
        } else {
          localeToCheck = locale
        }

        if (localeToCheck === userBaseLang) {
          toReturn = locale
        }
      }
    }
  }

  return toReturn
}

export function getAvailableLanguages() {
  if (!translations || typeof translations !== 'object') {
    return []
  }

  const availableLangs = []

  for (const languageCode in translations) {
    // Don't include English b/c we hard-code it in the footer dropdown to make sure it's always available
    if (languageCode !== 'en-US') {
      availableLangs.push({
        selectedLanguageCode: languageCode,
        selectedLanguageFull: getLanguageNativeName(languageCode)
      })
    }
  }

  return availableLangs
}

export function getLanguageNativeName(langCode) {
  let selectedLanguageFull
  if (/zh/.test(langCode)) {
    if (langCode === 'zh-CN') {
      selectedLanguageFull = '简体中文'
    } else if (langCode === 'zh-TW') {
      selectedLanguageFull = '繁體中文'
    }
  } else if (/fil/.test(langCode)) {
    selectedLanguageFull = 'Filipino'
  } else {
    selectedLanguageFull = localeCode.getLanguageNativeName(langCode)
  }

  return selectedLanguageFull
}

export function setGlobalIntlProvider(language, messages) {
  const { intl } = new IntlProvider(
    { locale: language, messages: messages },
    {}
  ).getChildContext()
  globalIntlProvider = intl
}

export function GlobalIntlProvider() {
  return globalIntlProvider
}

export function translateSchema(schemaJson) {
  if (!schemaJson) {
    return
  }
  
  // Copy the schema so we don't modify the original
  const schema = JSON.parse(JSON.stringify(schemaJson))
  const properties = schema.properties

  for (const property in properties) {
    const propertyObj = properties[property]

    if (propertyObj.title) {
      propertyObj.title = globalIntlProvider.formatMessage(
        schemaMessages[propertyObj.title]
      )
    }

    if (propertyObj.enum && propertyObj.enum.length) {
      propertyObj.enumNames = propertyObj.enum.map(
        enumStr =>
          typeof enumStr === 'string'
            ? globalIntlProvider.formatMessage(
              schemaMessages[enumStr]
            )
            : enumStr
      )
    }
  }

  return schema
}

export function translateListingCategory(rawCategory = '') {
  let messageKey = rawCategory

  if (!/schema\./.test(rawCategory)) {
    messageKey = `schema.${rawCategory}`
  }

  if (!schemaMessages[messageKey]) {
    return rawCategory
  }

  return globalIntlProvider.formatMessage(schemaMessages[messageKey])
}
