import { withFilter } from 'graphql-subscriptions'
import pubsub from '../utils/pubsub'

export default {
  newBlock: { subscribe: () => pubsub.asyncIterator('NEW_BLOCK') },
  transactionUpdated: {
    subscribe: () => pubsub.asyncIterator('TRANSACTION_UPDATED')
  },
  transactionUpdated2: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('TRANSACTION_UPDATED'),
      (payload, variables) => {
        console.log(payload, variables)
        return payload.transactionUpdated2.id === variables.id
      }
    )
  },
  newTransaction: {
    subscribe: () => pubsub.asyncIterator('NEW_TRANSACTION')
  },
  newNotification: {
    subscribe: () => pubsub.asyncIterator('NEW_NOTIFICATION')
  }
}
