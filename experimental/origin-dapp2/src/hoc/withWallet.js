import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import WalletQuery from 'queries/Wallet'

function withWallet(WrappedComponent) {
  const WithWallet = props => {
    return (
      <Query query={WalletQuery}>
        {({ data, networkStatus }) => {
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
