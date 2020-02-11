import React from 'react'
import ReactDOM from 'react-dom'

import { HashRouter, BrowserRouter } from 'react-router-dom'
import Styl from 'react-styl'

import { StateProvider } from 'data/state'
import App from './pages/App'
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
  return (
    <StateProvider>
      <Router>
        <App />
      </Router>
    </StateProvider>
  )
}

ReactDOM.render(<Providers />, document.getElementById('app'))

Styl.addStylesheet()
