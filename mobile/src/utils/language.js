'use strict'

import { IntlViewerContext, init } from 'fbt-runtime'
import * as RNLocalize from 'react-native-localize'

import { TRANSLATIONS } from '../constants'

export default function setFbtLanguage(language) {
  if (!language) {
    const bestAvailable = RNLocalize.findBestAvailableLanguage(
      Object.keys(TRANSLATIONS).map(x => x.replace('_', '-'))
    )
    if (bestAvailable && bestAvailable.languageTag) {
      language = bestAvailable.languageTag.replace('-', '_')
    }
  }
  if (language && TRANSLATIONS[language]) {
    init({ translations: { [language]: TRANSLATIONS[language] } })
    IntlViewerContext.locale = language
  }
}
