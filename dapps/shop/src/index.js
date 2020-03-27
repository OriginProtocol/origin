import React from 'react'
import ReactDOM from 'react-dom'

import { HashRouter, BrowserRouter } from 'react-router-dom'
import Styl from 'react-styl'

import { StateProvider } from 'data/state'
import App from './pages/App'
import useConfig from 'utils/useConfig'
import './css/app.scss'
import './css/app.css'

const Router = process.env.ABSOLUTE ? BrowserRouter : HashRouter

if (process.env.NODE_ENV === 'production') {
  try {
    require('../public/app.css')
  } catch (e) {
    console.warn('No built CSS found')
  }
}

const Providers = () => {
  const { loading, config } = useConfig()
  if (loading) {
    return null
  }
  return (
    <Router>
      <StateProvider storage={config.backendAuthToken}>
        <App config={config} />
      </StateProvider>
    </Router>
  )
}

ReactDOM.render(<Providers />, document.getElementById('app'))

Styl.addStylesheet()
