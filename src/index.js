import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app'
import { Provider } from 'react-redux'
import Store from './Store'
import IntlProvider from 'react-intl'
import addLocales from './utils/addLocales'
import translations from './../messages/data.json'

// Add locale data to react-intl
addLocales()

// Detect user's preferred settings
const language = (navigator.languages && navigator.languages[0]) ||
                 navigator.language ||
                 navigator.userLanguage;

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
const messages = translations[languageWithoutRegionCode] || translations[language] || translations.en;

ReactDOM.render(
  <Provider store={Store}>
    <IntlProvider locale={language} messages={messages}>
      <App />
    </IntlProvider>
  </Provider>,
  document.getElementById('root')
)
