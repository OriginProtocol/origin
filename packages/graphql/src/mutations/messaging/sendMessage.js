import contracts from '../../contracts'

async function sendMessage(_, { to, content, media }) {
  if (!content && !media) {
    return {
      error: 'Message should contain a text or a media'
    }
  }

  to = contracts.web3.utils.toChecksumAddress(to)
  try {
    const id = await contracts.messaging.sendConvMessage(to, { content, media })
    return {
      success: true,
      conversation: { id }
    }
  } catch (err) {
    console.error('Failed to send message', err)
    return {
      error: err.message
    }
  }
}

export default sendMessage
