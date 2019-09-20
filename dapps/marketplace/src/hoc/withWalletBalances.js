import React from 'react'
import { useQuery } from '@apollo/react-hooks'
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

function withWalletBalances(WrappedComponent, targets, walletProp = 'wallet') {
  const WithWalletBalances = props => {
    const { data, refetch } = useQuery(query, {
      skip: !props.wallet,
      variables: {
        account: props[walletProp],
        proxy: props.walletPredictedProxy,
        tokens: targets
      },
      fetchPolicy: 'network-only'
    })
    return (
      <WrappedComponent
        {...props}
        currencies={get(data, 'currencies') || []}
        refetchCurrencies={refetch}
      />
    )
  }
  return withWallet(WithWalletBalances)
}

export default withWalletBalances
