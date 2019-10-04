import contracts from '../../contracts'

export default async function markConversationRead(_, { id }) {
  return await contracts.messaging.markConversationRead(id)
}
