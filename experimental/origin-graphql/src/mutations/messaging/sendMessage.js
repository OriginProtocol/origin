import contracts from '../../contracts'

async function sendMessage(_, { to, content, media }) {
  if (!content && !media)
    throw new Error('sendMessage requires a message or media')

  to = contracts.web3.utils.toChecksumAddress(to)
  const id = await contracts.messaging.sendConvMessage(to, { content, media })
  return { id }
}

export default sendMessage
