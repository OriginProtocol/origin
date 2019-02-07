import contracts from '../../contracts'

export default async function markConversationRead(_, { id }) {
  if (!id) return false
  const messages = await contracts.messaging.getAllMessages(id)
  if (!messages) return false
  messages.forEach(({ hash }) =>
    contracts.messaging.set({ hash, status: 'read' })
  )
  return true
}
