import contracts from '../../contracts'

async function updateMessage(_, { hash, status }) {
  const updatedMessage = await contracts.messaging.set({ hash, status })
  return updatedMessage
}

export default updateMessage
