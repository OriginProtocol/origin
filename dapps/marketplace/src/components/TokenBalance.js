import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import tokenBalance from 'utils/tokenPrice'
import AccountTokenBalance from 'queries/TokenBalance'

const TokenBalance = ({ account, token, places }) => {
  if (!account || !token) return null
  return (
    <Query
      query={AccountTokenBalance}
      variables={{ account, token }}
      fetchPolicy="cache-and-network"
    >
      {({ data }) => {
        const tokenHolder = get(data, 'web3.account.token')
        if (!tokenHolder || !tokenHolder.balance) return null
        const decimals = tokenHolder.token.decimals
        return tokenBalance(tokenHolder.balance, decimals, places)
      }}
    </Query>
  )
}

export default TokenBalance
