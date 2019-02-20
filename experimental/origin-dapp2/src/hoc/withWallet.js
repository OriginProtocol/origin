import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import WalletQuery from 'queries/Wallet'

function withWallet(WrappedComponent) {
  const WithWallet = props => {
    return (
      <Query query={WalletQuery} pollInterval={1000}>
        {/* TODO: see if there's a way to avoid polling */}
        {({ data, error, networkStatus }) => {
          if (error) console.log(error)

          const walletType = get(data, 'web3.walletType')
          if (walletType && walletType.startsWith('mobile-')) {
            const wallet = get(data, 'web3.mobileWalletAccount.id')
            return (
              <WrappedComponent
                {...props}
                wallet={wallet}
                walletLoading={networkStatus === 1}
              />
            )
          }
          const wallet = get(data, 'web3.metaMaskAccount.id')
          return (
            <WrappedComponent
              {...props}
              wallet={wallet}
              walletLoading={networkStatus === 1}
            />
          )
        }}
      </Query>
    )
  }
  return WithWallet
}

export default withWallet
