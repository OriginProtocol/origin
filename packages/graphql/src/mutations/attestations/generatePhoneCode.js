import contracts from '../../contracts'
import get from 'lodash/get'

async function generatePhoneCode(_, { prefix, method = 'sms', phone }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }
  const url = `${bridgeServer}/api/attestations/phone/generate-code`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      country_calling_code: prefix,
      method,
      phone
    })
  })

  if (response.ok) {
    return { success: true }
  }

  const data = await response.json()
  return {
    success: false,
    reason: get(data, 'errors.phone[0]') || get(data, 'errors[0]')
  }
}

export default generatePhoneCode
