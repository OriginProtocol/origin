import get from 'lodash/get'

import contracts from '../../contracts'

async function verifyPromotion(
  _,
  { identity, identityProxy, socialNetwork, type, content }
) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  const url = `${bridgeServer}/api/promotions/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      identity,
      identityProxy,
      socialNetwork,
      type,
      content
    })
  })

  const data = await response.json()

  if (!response.ok) {
    return { success: false, reason: get(data, 'errors[0]') }
  }

  return {
    success: true,
    data: JSON.stringify(data)
  }
}

export default verifyPromotion
