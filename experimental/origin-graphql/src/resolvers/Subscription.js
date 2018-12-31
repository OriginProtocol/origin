import pubsub from '../utils/pubsub'

export default {
  newBlock: { subscribe: () => pubsub.asyncIterator('NEW_BLOCK') },
  transactionUpdated: {
    subscribe: () => pubsub.asyncIterator('TRANSACTION_UPDATED')
  },
  newNotification: {
    subscribe: () => pubsub.asyncIterator('NEW_NOTIFICATION')
  }
}
