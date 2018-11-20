import contracts from '../contracts'

export default {
  conversations: () =>
    new Promise(async resolve => {
      const convos = await contracts.messaging.getMyConvs()
      resolve(
        Object.keys(convos).map(id => ({ id, timestamp: String(convos[id]) }))
      )
    }),
  enabled: messaging => {
    return new Promise(async resolve => {
      const canReceive = await contracts.messaging.canReceiveMessages(
        messaging.id
      )
      resolve(canReceive ? true : false)
    })
  }
}
