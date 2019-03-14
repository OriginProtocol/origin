import contracts from '../../contracts'

import sortBy from 'lodash/sortBy'

function isEnabled() {
  return contracts.messaging.pub_sig &&
    contracts.messaging.account &&
    contracts.messaging.account.publicKey
    ? true
    : false
}

const welcomeMessage = `You can use Origin Messaging to chat with other users. Origin Messaging allows you to communicate with other users in a secure and decentralized way. Messages are private and, usually, can only be read by you or the recipient. In the case that either of you opens a dispute, messages can also be read by a third-party arbitrator.

Get started with messaging in two steps. First, you will use your Ethereum wallet to enable Origin Messaging. Then you will sign your public messaging key so that other users can find and chat with you. Using Origin Messaging is free and will not cost you any ETH or Origin Token.`

const congratsMessage = `Congratulations! You can now message other users on Origin. Why not start by taking a look around and telling us what you think about our DApp?`

export async function getAllMessages(conversationId) {
  let messages =
    (await contracts.messaging.getAllMessages(conversationId)) || []

  messages = sortBy(messages, m => m.msg.created)

  const supportAccount = contracts.config.messagingAccount
  if (supportAccount && conversationId === supportAccount) {
    const created = messages.length ? messages[0].msg.created : +new Date()
    if (isEnabled()) {
      messages.unshift({
        msg: { content: congratsMessage, created },
        hash: 'origin-congrats-message',
        address: supportAccount,
        index: -1
      })
    }
    messages.unshift({
      msg: { content: welcomeMessage, created },
      hash: 'origin-welcome-message',
      address: supportAccount,
      index: -2
    })
  }

  return messages.map(m => getMessage(m))
}

export async function totalUnread(account) {
  const messages = await getAllMessages(account)
  return messages.reduce((m, o) => {
    const addr = o.address || ''
    if (addr.toLowerCase() !== account.toLowerCase()) return m
    return m + (o.status === 'unread' ? 1 : 0)
  }, 0)
}

function getMessage(message) {
  if (!message) return null
  let status = contracts.messaging.getStatus(message)
  if (message.hash === 'origin-welcome-message' && !isEnabled()) {
    status = 'unread'
  }
  return {
    ...message,
    content: message.msg.content,
    media: message.msg.media,
    timestamp: Math.round(message.msg.created / 1000),
    status
  }
}

export default {
  messages: async account => await getAllMessages(account.id),
  lastMessage: account =>
    new Promise(async resolve => {
      const messages = await getAllMessages(account.id)
      if (!messages) return resolve(null)
      resolve(getMessage(messages[messages.length - 1]))
    }),
  totalUnread: account => totalUnread(account.id)
}
