import contracts from '../../contracts'
import filter from 'lodash/filter'

async function filterMessages(messages, wallet) {
  return filter(messages, async (msg) => {
    const status = await contracts.messaging.getStatus(msg)
    return status === 'unread' && msg.address !== wallet
  })
}

async function updateMessageStatus(messages) {
  return messages.map(async ({ hash }) => {
    return await contracts.messaging.set({ hash, status: 'read' })
  })
}

export default async function updateMessages(_, { id, wallet }) {
  await new Promise(async resolve => {
    const messages = await contracts.messaging.getAllMessages(id) || []
    const unreadMessages = await filterMessages(messages, wallet)

    if (unreadMessages.length) {
      await updateMessageStatus(unreadMessages)
    }
    resolve()
  })
}
