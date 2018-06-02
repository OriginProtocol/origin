import { addLocaleData } from 'react-intl'
import ar from 'react-intl/locale-data/ar'
import de from 'react-intl/locale-data/de'
import el from 'react-intl/locale-data/el'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import he from 'react-intl/locale-data/he'
import hr from 'react-intl/locale-data/hr'
import it from 'react-intl/locale-data/it'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import nl from 'react-intl/locale-data/nl'
import pt from 'react-intl/locale-data/pt'
import ru from 'react-intl/locale-data/ru'
import th from 'react-intl/locale-data/th'
import tr from 'react-intl/locale-data/tr'
import zh from 'react-intl/locale-data/zh'

const addLocales = () => {

  // If browser doesn't support Intl (i.e. Safari), then we manually import
  // the intl polyfill and locale data.
  if (!window.Intl) {
    require.ensure([
      'intl',
      'intl/locale-data/jsonp/en.js',
      'intl/locale-data/jsonp/es.js',
      'intl/locale-data/jsonp/fr.js',
      'intl/locale-data/jsonp/it.js',
    ], (require) => {
      require('intl')
      require('intl/locale-data/jsonp/en.js')
      require('intl/locale-data/jsonp/es.js')
      require('intl/locale-data/jsonp/fr.js')
      require('intl/locale-data/jsonp/it.js')
    })
  }

  addLocaleData([
    ...ar,
    ...de,
    ...el,
    ...en,
    ...es,
    ...fr,
    ...he,
    ...hr,
    ...it,
    ...ja,
    ...ko,
    ...nl,
    ...pt,
    ...ru,
    ...th,
    ...tr,
    ...zh])
}

export default addLocales
