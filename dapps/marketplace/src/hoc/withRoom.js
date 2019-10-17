import React, { useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'

import get from 'lodash/get'

import query from 'queries/Room'
import subscription from 'queries/NewMessageSubscription'

function withRoom(WrappedComponent) {
  const withRoom = props => {
    const { id } = props

    const {
      loading,
      error,
      data,
      networkStatus,
      fetchMore,
      subscribeToMore,
      refetch
    } = useQuery(query, {
      variables: { id },
      skip: !id,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only'
    })

    useEffect(() => {
      // Subscribe to New messages
      subscribeToMore({
        document: subscription,
        updateQuery: (prev, { subscriptionData }) => {
          const { conversationId, message } = subscriptionData.data.messageAdded
          const _message = {
            type: 'msg',
            offer: null,
            eventData: null,
            ...message
          }

          let newMessages = get(prev, 'messaging.conversation.messages', [])

          if (id === conversationId) {
            newMessages = newMessages.filter(m => m.index !== _message.index)
            newMessages = [_message, ...newMessages]
          }

          return {
            ...prev,
            messaging: {
              ...prev.messaging,
              conversation: {
                ...prev.messaging.conversation,
                messages: [...newMessages]
              }
            }
          }
        }
      })
    }, [id])

    const enabled = get(data, 'messaging.enabled', false)
    useEffect(() => {
      refetch()
    }, [enabled])

    const fetchMoreCallback = useCallback(
      ({ before }) => {
        // Fetch more
        fetchMore({
          variables: {
            id,
            before
          },
          updateQuery: (prevData, { fetchMoreResult }) => {
            const newMessages = fetchMoreResult.messaging.conversation.messages

            return {
              ...prevData,
              messaging: {
                ...prevData.messaging,
                conversation: {
                  ...prevData.messaging.conversation,
                  messages: newMessages
                }
              }
            }
          }
        })
      },
      [id]
    )

    return (
      <WrappedComponent
        {...props}
        room={get(data, 'messaging.conversation', null)}
        roomError={error}
        roomRefetch={refetch}
        roomNetworkStatus={networkStatus}
        roomLoading={loading || networkStatus === 1}
        roomFetchMore={fetchMoreCallback}
        roomLoadingMore={networkStatus === 3}
      />
    )
  }
  return withRoom
}

export default withRoom
