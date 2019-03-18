import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import CanBuyQuery from 'queries/CanBuy'

function withCanTransact(WrappedComponent) {
  const WithCanTransact = props => {
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
          if (!walletType) {
            return <WrappedComponent {...props} cannotTransact="no-wallet" />
          }

          const metaMaskId = get(data, 'web3.primaryAccount.id')
          // Use mobile wallet if it's available and MetaMask isn't enabled.
          if (walletType === 'mobile-linked' && !metaMaskId) {
            return <WrappedComponent {...props} />
          } else if (walletType === 'managed') {
            return <WrappedComponent {...props} />
          }

          if (!metaMaskId) {
            return <WrappedComponent {...props} cannotTransact="no-wallet" />
          }
          if (get(data, 'web3.metaMaskAccount.balance.eth') === '0') {
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
  return WithCanTransact
}

export default withCanTransact
