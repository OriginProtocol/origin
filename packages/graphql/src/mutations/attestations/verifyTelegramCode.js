import validator from '@origin/validator'
import get from 'lodash/get'

import contracts from '../../contracts'

async function verifyTelegramCode(_, { identity, phone, code }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }
  const url = `${bridgeServer}/api/attestations/telegram/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      code,
      identity,
      phone
    })
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = get(data, 'errors[0]')
    return { success: false, reason }
  }

  try {
    validator('https://schema.originprotocol.com/attestation_1.0.0.json', {
      ...data,
      schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
    })
  } catch (e) {
    return { success: false, reason: 'Invalid attestation' }
  }

  return {
    success: true,
    data: JSON.stringify(data)
  }
}

export default verifyTelegramCode
