import contracts from '../../contracts'

import { totalUnread } from './Conversation'

export default {
  conversations: () =>
    new Promise(async resolve => {
      const convos = await contracts.messaging.getMyConvs()
      resolve(
        Object.keys(convos).map(id => ({
          id,
          timestamp: Math.round(convos[id] / 1000)
        }))
      )
    }),
  conversation: (_, args) =>
    new Promise(async resolve => {
      const convos = await contracts.messaging.getMyConvs()
      if (!convos[args.id]) {
        resolve(null)
      }
      resolve({ id: args.id, timestamp: Math.round(convos[args.id] / 1000) })
    }),
  enabled: () => {
    return contracts.messaging.pub_sig &&
      contracts.messaging.account &&
      contracts.messaging.account.publicKey
      ? true
      : false
  },
  totalUnread: async () => {
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
  pubSig: () => contracts.messaging.pub_sig
}
