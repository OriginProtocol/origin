// Ensure storage is cleared on each deploy
const appHash = process.env.GIT_COMMIT_HASH || 'marketplace'
const ognNetwork = localStorage.ognNetwork
if (localStorage.appHash !== appHash) {
  /* Here we add exceptions we don't want to clear when app hash changes:
   *  - growth_auth_token: because it logs users out of rewards campaigns
   *  - screenConsole: because we want this setting of enabling html console
   *    persist across builds.
   */
  let exceptions = ['growth_auth_token', 'screenConsole']
  exceptions = exceptions
    .map(key => ({ key, value: localStorage.getItem(key) }))
    .filter(localStorageEntry => localStorageEntry.value !== null)
  localStorage.clear()
  exceptions.forEach(localStorageEntry =>
    localStorage.setItem(localStorageEntry.key, localStorageEntry.value)
  )

  sessionStorage.clear()
  localStorage.appHash = appHash
  localStorage.ognNetwork = ognNetwork
}

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
// import { persistCache } from 'apollo-cache-persist'
import { HashRouter } from 'react-router-dom'
import Styl from 'react-styl'
import client from '@origin/graphql'

import setLocale from 'utils/setLocale'
import Store from 'utils/store'
import { initSentry } from 'utils/sentry'
import { getCurrencyForLocale } from 'constants/Currencies'

import App from './pages/App'
import Analytics from './components/Analytics'
import './css/app.css'

const store = Store('localStorage')

if (process.env.NODE_ENV === 'production') {
  try {
    require('../public/app.css')
  } catch (e) {
    console.warn('No built CSS found')
  }
  if (process.env.SENTRY_DSN) {
    initSentry()
  }
} else {
  try {
    window.ognTools = require('@origin/graphql/fixtures/populate')
  } catch (e) {
    console.warn('No fixtures found')
  }
}

class AppWrapper extends Component {
  state = {
    ready: false,
    client: null,
    currency: null
  }

  async componentDidMount() {
    try {
      const locale = await setLocale()
      const currency = store.get('currency', getCurrencyForLocale(locale)[0])
      this.setState({ ready: true, client, locale, currency })
    } catch (error) {
      console.error('Error restoring Apollo cache', error)
    }
  }

  onLocale = async newLocale => {
    const locale = await setLocale(newLocale)
    this.setState({ locale })
    window.scrollTo(0, 0)
  }

  onCurrency = async currency => {
    await store.set('currency', currency)
    this.setState({ currency })
  }

  render() {
    const { ready, locale, currency } = this.state

    if (!ready) return null
    return (
      <ApolloProvider client={client}>
        <HashRouter>
          <Analytics>
            <App
              locale={locale}
              onLocale={this.onLocale}
              currency={currency}
              onCurrency={this.onCurrency}
            />
          </Analytics>
        </HashRouter>
      </ApolloProvider>
    )
  }
}

ReactDOM.render(
  <AppWrapper
    ref={app => {
      window.appComponent = app
    }}
  />,
  document.getElementById('app')
)

Styl.addStylesheet()
