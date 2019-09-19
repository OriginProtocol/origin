import contracts from '../../contracts'

import sortBy from 'lodash/sortBy'
import { withFilter } from 'graphql-subscriptions'
import pubsub from '../../utils/pubsub'

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

export async function getMessages(conversationId, { after, before } = {}) {
  const messages =
    (await contracts.messaging.getMessages(conversationId, { after, before })) || []

  const supportAccount = contracts.config.messagingAccount
  if (supportAccount && contracts.messaging.account_key !== supportAccount && conversationId === supportAccount) {
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

  return messages.map(m => getMessage(m))
}

/**
 * Returns count of all unread messages acroos conversations
 */
export async function getUnreadCount(account) {
  return contracts.messaging.getUnreadCount(account ? account.id : null)
}

export function getMessage(message) {
  if (!message) return null

  let read = message.msg.read
  if (message.hash === 'origin-welcome-message' && !isEnabled()) {
    message.read = true
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
  messages: async account => await getMessages(account.id, {
    before: account.before,
    after: account.after
  }),
  lastMessage: async account => {
    const messages = await getMessages(account.id)
    return messages && messages.length ? getMessage(messages[messages.length - 1]) : null
  },
  totalUnread: async account => {
    if (!isEnabled()) {
      return 1
    }

    return (await getUnreadCount(account) || 0)
  },
  hasMore: account => {
    const conv = contracts.messaging.getConvo(account.id)
    return conv && conv.hasMore
  }
}
