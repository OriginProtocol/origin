import contracts from '../../contracts'

async function getMessage(message) {
  if (!message) return null
  const status = await contracts.messaging.getStatus(message)
  return {
    ...message,
    content: message.msg.content,
    media: message.msg.media,
    timestamp: Math.round(message.msg.created / 1000),
    status
  }
}

export default {
  messages: conversation =>
    new Promise(async resolve => {
      const messages = await contracts.messaging.getAllMessages(conversation.id)
      resolve((messages || []).map(m => getMessage(m)))
    }),
  lastMessage: conversation =>
    new Promise(async resolve => {
      const rawMessages = await contracts.messaging.getAllMessages(
        conversation.id
      )
      const messages = rawMessages || []
      const lastMessage = messages[messages.length - 1]
      resolve(getMessage(lastMessage))
    }),
  totalUnread: (conversation, { wallet }) =>
    new Promise(async resolve => {
      if (wallet) {
        const messages = await contracts.messaging.getAllMessages(
          conversation.id
        ) || []

        const totalUnread = messages.reduce(async (result, msg) => {
          const message = await getMessage(msg)

          if ((message.status === 'unread') && (message.address !== wallet)) {
            return [...result, message]
          }
          return result
        }, [])

        return resolve(totalUnread.length)
      } else {
        resolve()
      }
    })
}
