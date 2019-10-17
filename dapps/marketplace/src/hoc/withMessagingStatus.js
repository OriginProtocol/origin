import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import query from 'queries/WalletStatus'

import get from 'lodash/get'

function withMessagingStatus(WrappedComponent, { excludeData } = {}) {
  const WithMessagingStatus = props => {
    const { data, loading, error, networkStatus, refetch } = useQuery(query)

    if (error) console.error('error executing WalletStatusQuery', error)

    const messagingEnabled = get(data, 'messaging.enabled', false)
    const isKeysLoading = get(data, 'messaging.isKeysLoading', true)
    const hasKeys =
      messagingEnabled &&
      get(data, 'messaging.pubKey') &&
      get(data, 'messaging.pubSig')
        ? true
        : false

    return (
      <WrappedComponent
        {...props}
        messagingStatusRefetch={refetch}
        messagingEnabled={messagingEnabled}
        messagingKeysLoading={isKeysLoading}
        hasMessagingKeys={hasKeys}
        messagingStatusError={error}
        messagingStatusLoading={loading || networkStatus === 1}
        messagingStatus={excludeData ? null : data}
      />
    )
  }
  return WithMessagingStatus
}

export default withMessagingStatus
