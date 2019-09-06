import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import query from 'queries/WalletStatus'

import get from 'lodash/get'

function withMessagingStatus(WrappedComponent) {
  const WithMessagingStatus = props => {
    const { data, loading, error } = useQuery(query)

    if (error) console.error(error)

    const messaging = get(data, 'messaging')
    const messagingEnabled = get(data, 'messaging.enabled', false)
    const hasKeys =
      messagingEnabled &&
      get(data, 'messaging.pubKey') &&
      get(data, 'messaging.pubSig')

    return (
      <WrappedComponent
        {...props}
        messagingEnabled={messagingEnabled}
        hasMessagingKeys={hasKeys}
        messagingStatusError={error}
        messagingStatusLoading={loading}
        messagingStatus={messaging}
      />
    )
  }
  return WithMessagingStatus
}

export default withMessagingStatus
