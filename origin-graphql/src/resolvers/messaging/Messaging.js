import contracts from '../../contracts'

import { totalUnread } from './Conversation'

function isEnabled() {
  return contracts.messaging.pub_sig &&
    contracts.messaging.account &&
    contracts.messaging.account.publicKey
    ? true
    : false
}

async function getMyConvs() {
  const rawConvos = isEnabled() ? await contracts.messaging.getMyConvs() : {}
  if (contracts.config.messagingAccount) {
    rawConvos[contracts.config.messagingAccount] = +new Date()
  }
  return rawConvos
}

async function convosWithSupport() {
  const rawConvos = await getMyConvs()
  return Object.keys(rawConvos).map(id => ({
    id,
    timestamp: Math.round(rawConvos[id] / 1000)
  }))
}

export default {
  enabled: () => isEnabled(),
  conversations: () => convosWithSupport(),
  conversation: (_, args) =>
    new Promise(async resolve => {
      const convos = await getMyConvs()
      if (!convos[args.id]) {
        resolve(null)
      }
      resolve({ id: args.id, timestamp: Math.round(convos[args.id] / 1000) })
    }),
  totalUnread: async () => {
    // Show 1 unread when messaging disabled. Intro message from Origin Support
    if (!isEnabled()) {
      return 1
    }
    const convos = await contracts.messaging.getMyConvs()
    const ids = Object.keys(convos)
    const allUnreads = await Promise.all(ids.map(c => totalUnread(c)))
    return allUnreads.reduce((m, o) => m + o, 0)
  },
  synced: () => {
    if (contracts.messaging.globalKeyServer) return true
    return contracts.messaging.synced
  },
  syncProgress: () => contracts.messaging.syncProgress,
  pubKey: () =>
    contracts.messaging.account ? contracts.messaging.account.publicKey : null,
  pubSig: () => contracts.messaging.pub_sig,
  canConverseWith: async (_, args) => {
    const recipient = await contracts.messaging.canReceiveMessages(args.id)
    return recipient ? true : false
  }
}
