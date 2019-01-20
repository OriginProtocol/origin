import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import AccountTokenBalance from 'queries/TokenBalance'

function withTokenBalance(WrappedComponent) {
  const WithTokenBalance = ({ wallet, token = 'OGN', ...props }) => (
    <Query query={AccountTokenBalance} variables={{ account: wallet, token }}>
      {({ data }) => (
        <WrappedComponent {...props} tokenBalance={tokenBalance(data)} />
      )}
    </Query>
  )
  return WithTokenBalance
}

export default withTokenBalance

function tokenBalance(data) {
  const tokenHolder = get(data, 'web3.account.token')
  if (!tokenHolder || !tokenHolder.balance) return 0
  const decimals = get(tokenHolder, 'token.decimals')

  const supplyBN = web3.utils.toBN(tokenHolder.balance)
  const decimalsBN = web3.utils.toBN(web3.utils.padRight('1', decimals + 1))
  return Number(supplyBN.div(decimalsBN))
}
