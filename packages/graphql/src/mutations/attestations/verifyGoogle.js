import verifyOAuth2Code from './../../utils/verifyOAuth2Code'

function verifyGoogle(_, { identity, authUrl, redirect, code }) {
  return verifyOAuth2Code('google', { identity, authUrl, redirect, code })
}

export default verifyGoogle
