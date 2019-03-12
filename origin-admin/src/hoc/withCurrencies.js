import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

const query = gql`
  query GetCurrencies {
    currencies {
      __typename
      ... on Currency {
        id
        name
        code
      }
    }
  }
`

function withCurrencies(WrappedComponent) {
  const WithCurrencies = props => (
    <Query query={query}>
      {({ data }) => (
        <WrappedComponent
          {...props}
          currencies={get(data, 'currencies') || []}
        />
      )}
    </Query>
  )
  return WithCurrencies
}

export default withCurrencies
