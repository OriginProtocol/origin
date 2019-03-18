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
          if (error) console.error(error)

          return (
            <WrappedComponent
              {...props}
              wallet={get(data, 'web3.primaryAccount.id')}
              walletType={get(data, 'web3.walletType')}
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
