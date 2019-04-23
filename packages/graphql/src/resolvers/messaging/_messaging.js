import get from 'lodash/get'

import contracts from '../../contracts'

function memoize(method) {
  let lastArgs
  let result

  return async function() {
    const currentArgs = JSON.stringify(arguments)
    if (currentArgs !== lastArgs) {
      result = method.apply(this, arguments)
      lastArgs = currentArgs
    }
    return result
  }
}

export default memoize(async function(id) {
  return await new Promise(async resolve => {
    contracts.messaging.events.once('initRemote', async () => {
      setTimeout(() => resolve({ id }), 500)
    })
    const messagingData = get(contracts, 'mobileBridge.privData.messaging')
    if (contracts.mobileBridge && messagingData) {
      await contracts.messaging.onPreGenKeys(messagingData)
    }
    await contracts.messaging.init(id)
  })
})
