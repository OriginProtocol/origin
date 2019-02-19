import React, { Component } from 'react'
import { Query } from 'react-apollo'

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
      <Query query={AccountTokenBalance} variables={{ account, token }}>
        {({ loading, error, data }) => {
          if (loading || error) return null
          const tokenHolder = data.web3.account.token
          if (!tokenHolder || !tokenHolder.balance) return null
          const decimals = tokenHolder.token.decimals
          return tokenBalance(tokenHolder.balance, decimals)
        }}
      </Query>
    )
  }
}

export default TokenBalance
