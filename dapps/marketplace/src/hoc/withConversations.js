import React, { useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import get from 'lodash/get'

import query from 'queries/Conversations'

import NewMessageSubscription from 'queries/NewMessageSubscription'
import MarkedAsReadSubscription from 'queries/MarkedAsReadSubscription'
import MessagingStatusChangeSubscription from 'queries/MessagingStatusChangeSubscription'

function withConversations(WrappedComponent) {
  const withConversations = props => {
    const {
      error,
      data,
      loading,
      refetch,
      fetchMore,
      networkStatus,
      subscribeToMore
    } = useQuery(query, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    })
    if (error) console.error(error)

    const isKeysLoading = get(data, 'messaging.isKeysLoading', true)
    const enabled = get(data, 'messaging.enabled', false)

    useEffect(() => {
      if (isKeysLoading || !enabled) {
        return
      }

      // Subscribe to new messages
      subscribeToMore({
        document: NewMessageSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          const {
            conversationId,
            message,
            totalUnread
          } = subscriptionData.data.messageAdded

          const newConvObject = {
            id: conversationId,
            lastMessage: message,
            totalUnread,
            __typename: 'Conversation'
          }

          let newConvs = get(prev, 'messaging.conversations', []).filter(
            conv => conv.id !== conversationId
          )

          newConvs = [newConvObject, ...newConvs]

          return {
            ...prev,
            messaging: {
              ...prev.messaging,
              conversations: [...newConvs]
            }
          }
        }
      })
    }, [isKeysLoading, enabled])

    // When a conversation is marked as read
    subscribeToMore({
      document: MarkedAsReadSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        const {
          conversationId,
          totalUnread
        } = subscriptionData.data.markedAsRead

        let newConvs = get(prev, 'messaging.conversations', [])

        const convIndex = newConvs.findIndex(conv => conv.id === conversationId)

        if (convIndex >= 0) {
          newConvs[convIndex] = {
            ...newConvs[convIndex],
            totalUnread: 0
          }
        }

        return {
          ...prev,
          messaging: {
            ...prev.messaging,
            totalUnread,
            conversations: [...newConvs]
          }
        }
      }
    })

    useSubscription(MessagingStatusChangeSubscription, {
      onSubscriptionData: () => refetch()
    })

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
        messagingEnabled={enabled}
      />
    )
  }
  return withConversations
}

export default withConversations
