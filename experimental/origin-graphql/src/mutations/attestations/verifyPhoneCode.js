import contracts from '../../contracts'
import get from 'lodash/get'

async function verifyPhoneCode(_, { identity, prefix, phone, code }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }
  const url = `${bridgeServer}/api/attestations/phone/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      country_calling_code: prefix,
      code,
      identity,
      phone
    })
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = get(data, 'errors._schema[0]')
    return { success: false, reason }
  }

  return {
    success: true,
    data: JSON.stringify(data)
  }
}

export default verifyPhoneCode
