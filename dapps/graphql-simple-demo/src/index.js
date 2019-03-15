import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import client from '@origin/graphql'

import Listings from './Listings'

ReactDOM.render(
  <ApolloProvider client={gql}>
    <Listings />
  </ApolloProvider>,
  document.getElementById('app')
)
