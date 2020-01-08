import React from 'react'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import get from 'lodash/get'

import WalletQuery from 'queries/Wallet'

import WalletUpdateSubscription from 'queries/WalletUpdateSubscription'

function withWallet(WrappedComponent) {
  const WithWallet = props => {
    const { data, error, networkStatus, refetch } = useQuery(WalletQuery, {
      fetchPolicy: 'network-only'
    })

    useSubscription(WalletUpdateSubscription, {
      // Wallet has changed, refetch proxy data
      onSubscriptionData: () => refetch()
    })

    if (error) console.error(error)
    const predicted = get(data, 'web3.primaryAccount.predictedProxy.id')
    return (
      <WrappedComponent
        {...props}
        wallet={get(data, 'web3.primaryAccount.id')}
        walletType={get(data, 'web3.walletType')}
        walletLoading={networkStatus === 1}
        walletProxy={get(data, 'web3.primaryAccount.proxy.id')}
        walletPredictedProxy={predicted}
      />
    )
  }
  return WithWallet
}

export default withWallet
