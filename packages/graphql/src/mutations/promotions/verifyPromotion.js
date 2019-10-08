import get from 'lodash/get'

import contracts from '../../contracts'

const MAX_TRIES = 30

async function verifyPromotion(
  _,
  { identity, identityProxy, socialNetwork, type, content }
) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  let tries = 0
  const url = new URL(`${bridgeServer}/api/promotions/verify`)

  url.searchParams.append('identity', identity)
  url.searchParams.append('identityProxy', identityProxy)
  url.searchParams.append('socialNetwork', socialNetwork)
  url.searchParams.append('type', type)
  if (content) url.searchParams.append('content', content)

  while (tries < MAX_TRIES) {
    const response = await fetch(url.toString(), {
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      method: 'GET'
    })
  
    if (!response.ok) {
      return { success: false, reason: get(data, 'errors[0]') }
    }
  
    const data = await response.json()
  
    if (data.verified) {
      return {
        success: true
      }
    }

    tries++
  }

  return {
    success: false,
    reason: 'Verification timed out. Please try again'
  }
}

export default verifyPromotion
