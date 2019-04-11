'use strict'

import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import AccountTokenBalance from 'queries/TokenBalance'

function tokenBalance(amount, decimals) {
  const supplyBN = web3.utils.toBN(amount)
  const decimalsBN = web3.utils.toBN(web3.utils.padRight('1', decimals + 1))
  return supplyBN.div(decimalsBN).toString()
}

class TokenBalance extends Component {
  render() {
    const { account, token } = this.props
    if (!account || !token) return null
    return (
      <Query
        query={AccountTokenBalance}
        variables={{ account, token }}
        fetchPolicy="cache-and-network"
      >
        {({ data }) => {
          const tokenHolder = get(data, 'web3.account.token')
          if (!tokenHolder || !tokenHolder.balance) return 0
          const decimals = tokenHolder.token.decimals
          return tokenBalance(tokenHolder.balance, decimals)
        }}
      </Query>
    )
  }
}

export default TokenBalance
