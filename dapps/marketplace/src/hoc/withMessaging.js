import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import get from 'lodash/get'

import query from 'queries/Conversations'

function withMessaging(WrappedComponent) {
  const withMessaging = props => {
    const {
      error,
      data,
      loading,
      refetch,
      fetchMore,
      networkStatus
    } = useQuery(query, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    })
    if (error) console.error(error)

    const isKeysLoading = get(data, 'messaging.isKeysLoading', true)

    return (
      <WrappedComponent
        {...props}
        messaging={data ? data.messaging : null}
        messagingError={error}
        messagingLoading={loading}
        messagingKeysLoading={isKeysLoading}
        messagingRefetch={refetch}
        messagingFetchMore={fetchMore}
        messagingNetworkStatus={networkStatus}
      />
    )
  }
  return withMessaging
}

export default withMessaging
