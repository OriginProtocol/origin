import { useCallback } from 'react'
import { useSubscription } from 'react-apollo'

import NewMessageSubscription from 'queries/NewMessageSubscription'
import MarkedAsReadSubscription from 'queries/MarkedAsReadSubscription'
import MessagingReadySubscription from 'queries/MessagingReadySubscription'

/**
 * Invokes the `refetch` prop when
 *  1. messaging is ready
 *  2. a conversation has been marked as read
 *  3. a new message is added to the conversation
 */
const RefetchOnMessageData = ({ refetch }) => {
  const callback = useCallback(() => {
    try {
      refetch()
    } catch (e) {
      console.error('failed to refetch', e)
    }
  })

  useSubscription(NewMessageSubscription, {
    onSubscriptionData: callback
  })

  useSubscription(MarkedAsReadSubscription, {
    onSubscriptionData: callback
  })

  useSubscription(MessagingReadySubscription, {
    onSubscriptionData: callback
  })

  return null
}

export default RefetchOnMessageData
