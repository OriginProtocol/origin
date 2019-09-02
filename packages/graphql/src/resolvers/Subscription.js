import { withFilter } from 'graphql-subscriptions'
import pubsub from '../utils/pubsub'

import { getMessage } from './messaging/Conversation'

export default {
  newBlock: { subscribe: () => pubsub.asyncIterator('NEW_BLOCK') },
  transactionUpdated: {
    subscribe: () => pubsub.asyncIterator('TRANSACTION_UPDATED')
  },
  transactionUpdated2: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('TRANSACTION_UPDATED'),
      (payload, variables) => {
        return payload.transactionUpdated2.id === variables.id
      }
    )
  },
  newTransaction: {
    subscribe: () => pubsub.asyncIterator('NEW_TRANSACTION')
  },
  newNotification: {
    subscribe: () => pubsub.asyncIterator('NEW_NOTIFICATION')
  },
  messageAdded: {
    resolve: payload => {
      return {
        ...payload.messageAdded,
        message: getMessage(payload.messageAdded.message)
      }
    },
    subscribe: () => pubsub.asyncIterator('MESSAGE_ADDED')
  }
}
