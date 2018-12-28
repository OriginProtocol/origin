require('dotenv').config()

import React from 'react'
import ReactDOM from 'react-dom'
import { Route, HashRouter } from 'react-router-dom'
import { Web3Provider } from 'react-web3'

import App from './App'

ReactDOM.render(
  <Web3Provider>
    <HashRouter>
      <Route component={App} />
    </HashRouter>,
  </Web3Provider>,
  document.getElementById('app')
)

require('react-styl').addStylesheet()
