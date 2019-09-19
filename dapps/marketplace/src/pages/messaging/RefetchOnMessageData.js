import { useSubscription } from 'react-apollo'

import NewMessageSubscription from 'queries/NewMessageSubscription'

const RefetchOnMessageData = ({ refetch }) => {
  useSubscription(NewMessageSubscription, {
    onSubscriptionData: () => refetch()
  })

  return null
}

export default RefetchOnMessageData
