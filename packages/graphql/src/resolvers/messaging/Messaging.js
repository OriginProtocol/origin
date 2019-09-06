import contracts from '../../contracts'
import { proxyOwner } from '../../utils/proxy'
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

async function decryptOutOfBandMessage(_, args) {
  let encrypted
  try {
    encrypted = JSON.parse(args.encrypted)
  } catch (e) {
    throw new Error('Message to decrypt must be JSON')
  }
  const d = await contracts.messaging.decryptOutOfBandMessage(encrypted)
  if (d === null) {
    throw new Error('Could not decrypt message')
  }
  return d.content
}
// We need to do this check inside the resolver function
const checkForMessagingOverride = () => {
  // needed for testing pu
  if (typeof localStorage !== 'undefined' && localStorage.useMessagingObject) {
    messagingOverride = JSON.parse(localStorage.useMessagingObject)
  }
}
let messagingOverride

export default {
  enabled: () => {
    checkForMessagingOverride()
    return messagingOverride ? messagingOverride.enabled : isEnabled()
  },
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
  },
  forwardTo: async (_, args) => {
    // If this is a proxy contract, provide the owner's address as a forwarding address
    if (contracts.config.proxyAccountsEnabled) {
      // Can not convers with proxy accounts, get owner
      try {
        const owner = await proxyOwner(args.id)
        console.log('using owner', owner)
        if (owner && owner.length > 2) return owner
      } catch (e) {
        /* pass */
      }
    }
    return null
  },
  decryptOutOfBandMessage: decryptOutOfBandMessage,
  decryptShippingAddress: async (_, args) => {
    const data = await decryptOutOfBandMessage(_, args)
    return JSON.parse(data.content)
  }
}
