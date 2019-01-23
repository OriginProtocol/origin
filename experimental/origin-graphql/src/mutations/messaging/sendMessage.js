import contracts from '../../contracts'

async function sendMessage(_, { to, content }) {
  to = contracts.web3.utils.toChecksumAddress(to)
  const id = await contracts.messaging.sendConvMessage(to, { content })
  return { id }
}

export default sendMessage
