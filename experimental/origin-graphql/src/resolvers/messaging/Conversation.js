import contracts from '../../contracts'

async function getMessages(conversationId) {
  const messages = await contracts.messaging.getAllMessages(conversationId)
  return (messages || []).map(m => getMessage(m))
}

export async function totalUnread(conversationId) {
  const messages = await getMessages(conversationId)
  return messages.reduce((m, o) => m + (o.status === 'unread' ? 1 : 0), 0)
}

function getMessage(message) {
  if (!message) return null
  return {
    ...message,
    content: message.msg.content,
    media: message.msg.media,
    timestamp: Math.round(message.msg.created / 1000),
    status: contracts.messaging.getStatus(message)
  }
}

export default {
  messages: conversation => getMessages(conversation.id),
  lastMessage: conversation =>
    new Promise(async resolve => {
      const messages = await contracts.messaging.getAllMessages(conversation.id)
      if (!messages) return resolve(null)
      resolve(getMessage(messages[messages.length - 1]))
    }),
  totalUnread: conversation => totalUnread(conversation.id)
}
