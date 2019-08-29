import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import WalletStatusQuery from 'queries/WalletStatus'

function withMessagingStatus(WrappedComponent, walletProp = 'walletProxy') {
  const WithMessagingStatus = props => {
    const { data } = useQuery(WalletStatusQuery, {
      notifyOnNetworkStatusChange: true
    })

    const messaging = get(data, 'messaging')
    return <WrappedComponent {...props} messagingStatus={messaging} />
  }
  return WithMessagingStatus
}

export default withMessagingStatus
