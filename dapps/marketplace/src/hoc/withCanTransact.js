import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import CanBuyQuery from 'queries/CanBuy'

import withConfig from './withConfig'

function withCanTransact(WrappedComponent) {
  const WithCanTransact = ({ config, ...props }) => {
    return (
      <Query query={CanBuyQuery}>
        {({ data, error, loading }) => {
          if (error) {
            return <WrappedComponent {...props} cannotTransact="load-error" />
          }
          if (loading) {
            return <WrappedComponent {...props} cannotTransact="loading" />
          }

          const walletType = get(data, 'web3.walletType')
          const metaMaskId = get(data, 'web3.metaMaskAccount.id')
          if (!walletType) {
            return <WrappedComponent {...props} cannotTransact="no-wallet" />
          }
          // Use mobile wallet if it's available and MetaMask isn't enabled.
          if (walletType == 'Mobile' && !metaMaskId) {
            return <WrappedComponent {...props} />
          }
          if (walletType === 'Web3 Wallet') {
            return <WrappedComponent {...props} />
          }

          if (!metaMaskId) {
            return <WrappedComponent {...props} cannotTransact="no-wallet" />
          }

          const balance = get(data, 'web3.metaMaskAccount.balance.eth')
          if (balance === '0' && !config.relayer) {
            return <WrappedComponent {...props} cannotTransact="no-balance" />
          }

          const desiredNetwork = get(data, 'web3.networkId'),
            selectedNetwork = get(data, 'web3.metaMaskNetworkId')

          if (desiredNetwork !== selectedNetwork) {
            return (
              <WrappedComponent
                {...props}
                cannotTransact="wrong-network"
                cannotTransactData={get(data, 'web3.networkName')}
              />
            )
          }

          return <WrappedComponent {...props} />
        }}
      </Query>
    )
  }
  return withConfig(WithCanTransact)
}

export default withCanTransact
