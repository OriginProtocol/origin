import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

const query = gql`
  query GetCurrencyBalances($tokens: [String], $account: String!) {
    currencies(tokens: $tokens) {
      __typename
      ... on Currency {
        id
        name
        code
        priceInUSD
      }
      ... on Token {
        id
        decimals
        balance(address: $account)
        allowance(address: $account, target: "marketplace")
      }
    }
  }
`

function withCurrencyBalances(WrappedComponent) {
  const WithCurrencyBalances = props => (
    <Query
      query={query}
      variables={{ account: props.wallet, tokens: props.targets }}
      fetchPolicy="network-only"
    >
      {({ data }) => (
        <WrappedComponent
          {...props}
          currencies={get(data, 'currencies') || []}
        />
      )}
    </Query>
  )
  return WithCurrencyBalances
}

export default withCurrencyBalances
