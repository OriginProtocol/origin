import contracts from '../../contracts'

async function sendMessage(_, { to, content }) {
  await new Promise(async (resolve) => {
    to = contracts.web3.utils.toChecksumAddress(to)
    await contracts.messaging.sendConvMessage(to, { content })
    resolve(true)
  })
}

export default sendMessage
