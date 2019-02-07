import contracts from '../../contracts'
import get from 'lodash/get'

async function verifyFacebook(_, { identity }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false }
  }
  const authUrl = `${bridgeServer}/api/attestations/facebook/auth-url`
  const response = await fetch(authUrl, {
    headers: { 'content-type': 'application/json' }
  })

  const authData = await response.json()

  return new Promise(resolve => {
    const fbWindow = window.open(authData.url, '', 'width=650,height=500')

    const finish = async e => {
      const iframeData = String(e.data)
      if (!iframeData.match(/^origin-code:/)) {
        return
      }
      window.removeEventListener('message', finish, false)
      if (!fbWindow.closed) {
        fbWindow.close()
      }

      const url = `${bridgeServer}/api/attestations/facebook/verify`

      const response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          code: iframeData.split(':')[1],
          identity
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
        resolve({ success: false, reason })
      }

      resolve({
        success: true,
        data: JSON.stringify(data)
      })
    }

    window.addEventListener('message', finish, false)
  })
}

export default verifyFacebook
