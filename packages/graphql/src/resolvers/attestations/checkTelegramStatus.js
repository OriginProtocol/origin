import validator from '@origin/validator'
import get from 'lodash/get'

import contracts from '../../contracts'

import sleep from '../../utils/sleep'

const MAX_TRIES = 20

/**
 * Polls the bridge to check if the user has done
 * any Telegram attestation recently.
 * @param {String} args.identity User's ETH address
 * @returns {Object} an object similar to `{ success: <Boolean>, data?: <AttestationData> }`
 */
async function checkTelegramStatus(_, { identity }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  let tries = 0
  const url = `${bridgeServer}/api/attestations/telegram/status?identity=${identity}`

  while (tries < MAX_TRIES) {
    const response = await fetch(url, {
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

      return {
        success: true,
        data: {
          ...data,
          attestation: JSON.stringify(data.attestation)
        }
      }
    }

    tries++

    await sleep(1000)
  }

  return {
    success: false,
    reason: 'Verification timed out. Please try again'
  }
}

export default checkTelegramStatus
