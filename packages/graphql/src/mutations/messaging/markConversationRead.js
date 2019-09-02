import contracts from '../../contracts'

import { getMessages } from '../../resolvers/messaging/Conversation'

export default async function markConversationRead(_, { id }) {
  if (!id) return false
  const messages = await getMessages(id)
  if (!messages) return false
  messages.forEach(({ hash }) =>
    contracts.messaging.set({ hash, status: 'read' })
  )
  return true
}
