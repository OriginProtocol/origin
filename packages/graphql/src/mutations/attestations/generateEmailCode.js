import contracts from '../../contracts'
import get from 'lodash/get'

async function generateEmailCode(_, { email }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }
  const url = `${bridgeServer}/api/attestations/email/generate-code`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({ email })
  })

  if (response.ok) {
    return { success: true }
  }

  const data = await response.json()
  return { success: false, reason: get(data, 'errors[0]') }
}

export default generateEmailCode
