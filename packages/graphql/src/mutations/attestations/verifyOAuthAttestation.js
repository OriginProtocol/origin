import validator from '@origin/validator'
import get from 'lodash/get'

import contracts from '../../contracts'

/**
 * Authorize user and verify and validate attestation
 * generated after authorization
 *
 * @param {*} provider One of supported attestation providers
 * @param {*} vars Variables from GraphQL mutation
 */
async function verifyOAuthAttestation(
  _,
  { provider, identity, authUrl, redirect, code }
) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  if (!authUrl) {
    let getAuthUrl = `${bridgeServer}/api/attestations/${provider}/auth-url`
    if (redirect) {
      getAuthUrl += `?redirect=${redirect}`
    }
    const response = await fetch(getAuthUrl, {
      headers: { 'content-type': 'application/json' }
    })
    const authData = await response.json()
    authUrl = authData.url
  }

  if (code) {
    return new Promise(async resolve => {
      const url = `${bridgeServer}/api/attestations/${provider}/verify`

      const response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          sid: code,
          identity
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
        resolve({ success: false, reason })
      }

      try {
        validator('https://schema.originprotocol.com/attestation_1.0.0.json', {
          ...data,
          schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
        })
      } catch (e) {
        return { success: false, reason: 'Invalid attestation' }
      }

      resolve({
        success: true,
        data: JSON.stringify(data)
      })
    })
  } else if (redirect) {
    return new Promise(() => (window.location = authUrl))
  }

  return new Promise(resolve => {
    const gWindow = window.open(authUrl, '', 'width=650,height=500')

    const finish = async e => {
      const iframeData = e.data

      if (!iframeData.originCode) {
        return
      }

      window.removeEventListener('message', finish, false)
      if (!gWindow.closed) {
        gWindow.close()
      }

      const url = `${bridgeServer}/api/attestations/${provider}/verify`

      const verifyParams = {
        code: iframeData.originCode,
        identity
      }

      if (iframeData.sid) {
        verifyParams.sid = iframeData.sid
      }

      const response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(verifyParams)
      })

      const data = await response.json()

      if (!response.ok) {
        const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
        resolve({ success: false, reason })
      }

      try {
        validator('https://schema.originprotocol.com/attestation_1.0.0.json', {
          ...data,
          schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
        })
      } catch (e) {
        return resolve({ success: false, reason: 'Invalid attestation' })
      }

      resolve({
        success: true,
        data: JSON.stringify(data)
      })
    }

    window.addEventListener('message', finish, false)
  })
}

export default verifyOAuthAttestation
