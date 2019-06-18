import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import get from 'lodash/get'

import withWallet from './withWallet'

const query = gql`
  query GetWalletBalances($tokens: [String], $account: String!) {
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
        balance(address: $account, format: true)
      }
    }
  }
`

function withWalletBalances(WrappedComponent, targets) {
  const WithWalletBalances = props => (
    <Query
      query={query}
      skip={!props.wallet}
      variables={{
        account: props.wallet,
        proxy: props.walletPredictedProxy,
        tokens: targets
      }}
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
  return withWallet(WithWalletBalances)
}

export default withWalletBalances
