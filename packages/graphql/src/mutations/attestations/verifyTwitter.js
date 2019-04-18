import validator from '@origin/validator'
import get from 'lodash/get'

import contracts from '../../contracts'

async function verifyTwitter(_, { identity, authUrl }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false, reason: 'No bridge server configured' }
  }

  if (!authUrl) {
    const getAuthUrl = `${bridgeServer}/api/attestations/twitter/auth-url`
    const response = await fetch(getAuthUrl, {
      headers: { 'content-type': 'application/json' }
    })
    const authData = await response.json()
    authUrl = authData.url
  }

  return new Promise(resolve => {
    const twWindow = window.open(authUrl, '', 'width=650,height=500')

    const finish = async e => {
      const iframeData = String(e.data)
      if (!iframeData.match(/^origin-code:/)) {
        return
      }
      window.removeEventListener('message', finish, false)
      if (!twWindow.closed) {
        twWindow.close()
      }

      const url = `${bridgeServer}/api/attestations/twitter/verify`

      const response = await fetch(url, {
        headers: { 'content-type': 'application/json', accept: '*/*' },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          identity,
          'oauth-verifier': iframeData.split(':')[1]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
        resolve({ success: false, reason })
        return
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
    }

    window.addEventListener('message', finish, false)
  })
}

export default verifyTwitter
