import contracts from '../../contracts'

async function sendMessage(_, { to, content, media }) {
  if (!content && !media) throw new Error('sendMessage requires a message or media')

  await new Promise(async (resolve) => {
    to = contracts.web3.utils.toChecksumAddress(to)
    await contracts.messaging.sendConvMessage(to, { content, media })
    resolve(true)
  })
}

export default sendMessage
