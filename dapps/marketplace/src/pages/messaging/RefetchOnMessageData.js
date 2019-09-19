import { useSubscription } from 'react-apollo'

import NewMessageSubscription from 'queries/NewMessageSubscription'
import MarkedAsReadSubscription from 'queries/MarkedAsReadSubscription'

const RefetchOnMessageData = ({ refetch }) => {
  useSubscription(NewMessageSubscription, {
    onSubscriptionData: () => {
      try {
        refetch()
      } catch (e) {
        console.error('failed to refetch', e)
      }
    }
  })

  useSubscription(MarkedAsReadSubscription, {
    onSubscriptionData: () => {
      try {
        refetch()
      } catch (e) {
        console.error('failed to refetch', e)
      }
    }
  })

  return null
}

export default RefetchOnMessageData
