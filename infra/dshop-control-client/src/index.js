import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import Styl from 'react-styl'
import axios from 'axios'

import App from './pages/App'
import './css/app.css'

if (process.env.NODE_ENV === 'production') {
  try {
    require('../public/app.css')
  } catch (e) {
    console.warn('No built CSS found')
  }
}

const Providers = () => {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  )
}

ReactDOM.render(<Providers />, document.getElementById('app'))

Styl.addStylesheet()
