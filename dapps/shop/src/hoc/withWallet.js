import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import WalletQuery from 'queries/Wallet'

function withWallet(WrappedComponent) {
  const WithWallet = props => {
    const { data, error, networkStatus } = useQuery(WalletQuery, {
      fetchPolicy: 'network-only',
      pollInterval: 1000
    })
    if (error) console.error(error)
    const predicted = get(data, 'web3.primaryAccount.predictedProxy.id')
    const walletType = get(data, 'web3.walletType')
    return (
      <WrappedComponent
        {...props}
        wallet={get(data, 'web3.primaryAccount.id')}
        walletType={walletType}
        walletLoading={networkStatus === 1}
        walletProxy={get(data, 'web3.primaryAccount.proxy.id')}
        walletPredictedProxy={predicted}
        isOriginWallet={
          walletType === 'Origin Wallet' || walletType === 'Mobile'
        }
      />
    )
  }
  return WithWallet
}

export default withWallet
