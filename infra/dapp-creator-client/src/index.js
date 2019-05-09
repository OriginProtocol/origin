require('dotenv').config()

import { Route, HashRouter } from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'
import Styl from 'react-styl'
import * as Sentry from '@sentry/browser'

import './css/app.css'
import App from './pages/App'

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN
  })
}

class AppWrapper extends React.Component {
  render() {
    return (
      <HashRouter>
        <Route component={App} />
      </HashRouter>
    )
  }
}

ReactDOM.render(<AppWrapper />, document.getElementById('app'))

Styl.addStylesheet()
