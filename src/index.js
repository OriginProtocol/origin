import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app'
import { Provider } from 'react-redux'
import Store from './Store'
import { IntlProvider } from 'react-intl'
import addLocales from './utils/addLocales'
import translations from './../locales/allMessages.json'

// Add locale data to react-intl
addLocales()

//
// TODO - move these language/messages variables to redux so we can allow user to change it via dropdown menu
//

// Detect user's preferred settings
const language = (navigator.languages && navigator.languages[0]) ||
                 navigator.language ||
                 navigator.userLanguage;

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
const messages = translations[languageWithoutRegionCode] || translations[language] || translations.en;

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

ReactDOM.render(
  <Provider store={Store}>
    <IntlProvider locale={language} messages={messages}>
      <App />
    </IntlProvider>
  </Provider>,
  document.getElementById('root')
)
