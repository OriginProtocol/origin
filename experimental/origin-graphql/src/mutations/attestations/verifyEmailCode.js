import contracts from '../../contracts'
import get from 'lodash/get'

async function verifyEmailCode(_, { identity, email, code }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false }
  }
  const url = `${bridgeServer}/api/attestations/email/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      code,
      identity,
      email
    })
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
    return { success: false, reason }
  }

  return {
    success: true,
    claimType: data['claim-type'],
    data: contracts.web3.utils.soliditySha3(data.data),
    signature: data.signature
  }
}

export default verifyEmailCode
