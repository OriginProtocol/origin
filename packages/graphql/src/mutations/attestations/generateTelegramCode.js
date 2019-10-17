import contracts from '../../contracts'
import get from 'lodash/get'

async function generateTelegramCode(_, { identity }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  const url = `${bridgeServer}/api/attestations/telegram/generate-code`
  const params = `identity=${identity}`

  const response = await fetch(`${url}?${params}`, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST'
  })

  const data = await response.json()

  if (response.ok) {
    return { success: true, code: data.code }
  }

  return { success: false, reason: get(data, 'errors[0]') }
}

export default generateTelegramCode
