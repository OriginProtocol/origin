import contracts from '../../contracts'

export function isEnabled() {
  return contracts.messaging.ready
}

const welcomeMessage = `You can use Origin Messaging to chat with other users. Origin Messaging allows you to communicate with other users in a secure and decentralized way. Messages are private and, usually, can only be read by you or the recipient. In the case that either of you opens a dispute, messages can also be read by a third-party arbitrator.

Get started with messaging in two steps. First, you will use your Ethereum wallet to enable Origin Messaging. Then you will sign your public messaging key so that other users can find and chat with you. Using Origin Messaging is free and will not cost you any ETH or Origin Token.`

const congratsMessage = `Congratulations! You can now message other users on Origin. Why not start by taking a look around and telling us what you think about our DApp?`

export async function getMessages(conversationId, { after, before } = {}) {
  let messages = []

  if (isEnabled()) {
    messages =
      (await contracts.messaging.getMessages(conversationId, {
        after,
        before
      })) || []
  }

  const supportAccount = contracts.config.messagingAccount
  if (
    supportAccount &&
    contracts.messaging.account_key !== supportAccount &&
    conversationId === supportAccount
  ) {
    const hasInjectedMessages = messages.find(x => x.index < 0)

    if (!hasInjectedMessages) {
      const created = 1483209000000 // 01/01/2017
      if (isEnabled()) {
        messages.push({
          msg: { content: congratsMessage, created },
          hash: 'origin-congrats-message',
          address: supportAccount,
          index: -1
        })
      }
      messages.push({
        msg: { content: welcomeMessage, created },
        hash: 'origin-welcome-message',
        address: supportAccount,
        index: -2
      })
    }
  }

  return await Promise.all(messages.map(m => getMessage(m)))
}

/**
 * Returns count of all unread messages acroos conversations
 */
export async function getUnreadCount(account) {
  return contracts.messaging.getUnreadCount(account ? account.id : null)
}

export async function getMessage(message) {
  if (!message) return null

  if (message.type === 'event') {
    // Not resolving the offerID to offer here due to performance reasons
    // Moved that to HOC
    return {
      ...message,
      eventData: message.msg,
      content: null,
      media: null,
      timestamp: Math.round(new Date(message.msg.blockDate).getTime() / 1000),
      read: true
    }
  }

  let read = message.msg.read
  if (message.hash === 'origin-welcome-message') {
    read = isEnabled()
  }

  return {
    ...message,
    content: message.msg.content,
    media: message.msg.media,
    timestamp: Math.round(message.msg.created / 1000),
    read
  }
}

export default {
  messages: async account =>
    await getMessages(account.id, {
      before: account.before,
      after: account.after
    }),
  lastMessage: async account => {
    const messages = await getMessages(account.id)
    return messages && messages.length ? getMessage(messages[0]) : null
  },
  totalUnread: async account => {
    if (!isEnabled()) {
      return 1
    }

    return (await getUnreadCount(account)) || 0
  },
  hasMore: account => {
    const conv = contracts.messaging.getConvo(account.id)
    return conv && conv.hasMore
  }
}
