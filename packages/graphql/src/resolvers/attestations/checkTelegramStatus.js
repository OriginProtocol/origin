import validator from '@origin/validator'
import get from 'lodash/get'

import contracts from '../../contracts'

async function checkTelegramStatus(_, { identity }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  const url = `${bridgeServer}/api/attestations/telegram/status?identity=${identity}`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include'
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = get(data, 'errors[0]')
    return { success: false, reason }
  }

  if (data.verified) {
    // Validate only if verified
    try {
      validator('https://schema.originprotocol.com/attestation_1.0.0.json', {
        ...data.attestation,
        schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
      })
    } catch (e) {
      return { success: false, reason: 'Invalid attestation' }
    }
  }

  return {
    success: true,
    data: {
      ...data,
      attestation: JSON.stringify(data.attestation)
    }
  }
}

export default checkTelegramStatus
