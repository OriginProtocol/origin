import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import { Route, HashRouter } from 'react-router-dom'

import client from '@origin/graphql'
import App from './pages/App'

ReactDOM.render(
  <ApolloProvider client={client}>
    <HashRouter>
      <Route component={App} />
    </HashRouter>
  </ApolloProvider>,
  document.getElementById('app')
)

require('react-styl').addStylesheet()
