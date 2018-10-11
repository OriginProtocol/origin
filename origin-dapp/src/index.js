import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from 'components/app'

import Store from './Store'

ReactDOM.render(
  <Provider store={Store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
