require('dotenv').config()

import { Route, HashRouter } from 'react-router-dom'
import { Web3Provider } from 'react-web3'
import React from 'react'
import ReactDOM from 'react-dom'
import Styl from 'react-styl'

import './css/app.css'
import App from './pages/App'

class AppWrapper extends React.Component {
  render () {
    return (
      <Web3Provider>
        <HashRouter>
          <Route component={App} />
        </HashRouter>
      </Web3Provider>
    )
  }
}

ReactDOM.render(<AppWrapper />, document.getElementById('app'))

Styl.addStylesheet()
