'use strict'

import { IntlViewerContext, init } from 'fbt-runtime'
import * as RNLocalize from 'react-native-localize'

import { TRANSLATIONS } from '../constants'

export default function setFbtLanguage(language) {
  if (!language) {
    language = findBestAvailableLanguage()
  }
  if (language && TRANSLATIONS[language]) {
    init({ translations: { [language]: TRANSLATIONS[language] } })
    IntlViewerContext.locale = language
  }
}

export function findBestAvailableLanguage() {
  const bestAvailable = RNLocalize.findBestAvailableLanguage(
    Object.keys(TRANSLATIONS).map(x => x.replace('_', '-').substr(0, 2))
  )

  let language = 'en_US'
  if (bestAvailable && bestAvailable.languageTag) {
    language = Object.keys(TRANSLATIONS).find(x => x.startsWith(bestAvailable.languageTag))
  }
  return language
}
