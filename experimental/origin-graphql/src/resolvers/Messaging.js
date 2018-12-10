import contracts from '../contracts'

export default {
  conversations: () =>
    new Promise(async resolve => {
      const convos = await contracts.messaging.getMyConvs()
      resolve(
        Object.keys(convos).map(id => ({ id, timestamp: String(convos[id]) }))
      )
    }),
  enabled: () => {
    return contracts.messaging.pub_sig &&
      contracts.messaging.account &&
      contracts.messaging.account.publicKey
      ? true
      : false
  },
  syncing: () => false,
  pubKey: () =>
    contracts.messaging.account ? contracts.messaging.account.publicKey : null,
  pubSig: () => contracts.messaging.pub_sig
}
