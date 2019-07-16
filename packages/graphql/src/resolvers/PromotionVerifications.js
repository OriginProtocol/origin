import contracts from '../contracts'

async function getVerificationStatus(identity) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return null
  }

  const statusURL = `${bridgeServer}/api/promotions/status?identity=${identity}`

  const response = await fetch(statusURL, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include'
  })

  const payload = await response.json()
  return payload.data
}

export default {
  getVerificationStatus: (_, { identity, ...args }) => getVerificationStatus(identity, args)
}
