import contracts from '../contracts'

async function sendMessage(_, { to, content }) {
  await new Promise(async (resolve) => {
    console.log({ to, content })
    await contracts.messaging.sendConvMessage(to, { content })
    resolve(true)
  })
}

export default sendMessage
