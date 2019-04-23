import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import AccountTokenBalance from 'queries/TokenBalance'

function tokenBalance(amount, decimals, places = 0) {
  const supplyBN = web3.utils.toBN(amount)
  const decimalsBN = web3.utils.toBN(
    web3.utils.padRight('1', decimals + 1 - places)
  )
  const str = supplyBN.div(decimalsBN).toString()
  if (places > 0) {
    return String(Number(str) / Math.pow(10, places))
  }
  return str
}

class TokenBalance extends Component {
  render() {
    const { account, token, places } = this.props
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
}

export default TokenBalance
