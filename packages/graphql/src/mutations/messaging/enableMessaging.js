import contracts from '../../contracts'

async function enableMessaging() {
  await new Promise(async (resolve, reject) => {
    try {
      contracts.messaging.events.once('ready', () => resolve(true))
      await contracts.messaging.startConversing()
    } catch (e) {
      console.error(`Error enabling messaging: ${e.message}`)
      reject(e)
    }
  })
}

export default enableMessaging
