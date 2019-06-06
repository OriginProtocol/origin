import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import CanBuyQuery from 'queries/CanBuy'

import withConfig from './withConfig'

function cannotTransact({ data, error, loading, canTransactConfig }) {
  if (error) {
    return { cannotTransact: 'load-error' }
  }
  if (loading) {
    return { cannotTransact: 'loading' }
  }
  const walletType = get(data, 'web3.walletType')
  const metaMaskId = get(data, 'web3.metaMaskAccount.id')
  if (!walletType) {
    return { cannotTransact: 'no-wallet' }
  }
  if (walletType === 'Mobile' && !metaMaskId) {
    return {}
  }
  if (walletType === 'Web3 Wallet') {
    return {}
  }
  const balance = get(data, 'web3.metaMaskAccount.balance.eth')
  if (balance === '0' && !canTransactConfig.relayer) {
    return { cannotTransact: 'no-balance' }
  }
  const desiredNetwork = get(data, 'web3.networkId'),
    selectedNetwork = get(data, 'web3.metaMaskNetworkId')

  if (desiredNetwork !== selectedNetwork) {
    return {
      cannotTransact: 'wrong-network',
      cannotTransactData: get(data, 'web3.networkName')
    }
  }

  return {}
}

function withCanTransact(WrappedComponent) {
  const WithCanTransact = ({ canTransactConfig, ...props }) => {
    return (
      <Query query={CanBuyQuery}>
        {({ data, error, loading }) => {
          return (
            <WrappedComponent
              {...props}
              {...cannotTransact({ data, error, loading, canTransactConfig })}
            />
          )
        }}
      </Query>
    )
  }
  return withConfig(WithCanTransact, 'canTransactConfig')
}

export default withCanTransact
