import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

const query = gql`
  query GetCurrencyBalances(
    $tokens: [String]
    $account: String!
    $proxy: String!
    $useProxy: Boolean!
  ) {
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
    proxyCurrencies: currencies(tokens: $tokens) @include(if: $useProxy) {
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
        balance(address: $proxy)
        allowance(address: $account, target: $proxy)
      }
    }
  }
`

function withCurrencyBalances(WrappedComponent) {
  const WithCurrencyBalances = props => (
    <Query
      query={query}
      skip={!props.wallet}
      variables={{
        account: props.wallet,
        proxy: props.walletProxy,
        tokens: props.targets,
        useProxy: props.walletProxy !== props.wallet
      }}
      fetchPolicy="network-only"
    >
      {({ data }) => (
        <WrappedComponent
          {...props}
          currencies={get(data, 'currencies') || []}
          proxyCurrencies={get(data, 'proxyCurrencies') || []}
        />
      )}
    </Query>
  )
  return WithCurrencyBalances
}

export default withCurrencyBalances
