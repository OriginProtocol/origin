import contracts from '../../contracts'
import get from 'lodash/get'

async function generatePhoneCode(_, { identity, airbnbUserId }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  const match = airbnbUserId.match(/([0-9]+)/)
  if (!match) {
    throw 'No Airbnb UserID found'
  }

  const url = `${bridgeServer}/api/attestations/airbnb/generate-code`
  const params = `identity=${identity}&airbnbUserId=${match[1]}`

  const response = await fetch(`${url}?${params}`, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include'
  })

  const data = await response.json()

  if (response.ok) {
    return { success: true, code: data.code }
  }

  return { success: false, reason: get(data, 'errors.airbnbUserId[0]') }
}

export default generatePhoneCode
