import contracts from '../../contracts'

async function enableMessaging() {
  await new Promise(async resolve => {
    contracts.messaging.events.once('ready', () => resolve(true))
    await contracts.messaging.startConversing()
  })
}

export default enableMessaging
