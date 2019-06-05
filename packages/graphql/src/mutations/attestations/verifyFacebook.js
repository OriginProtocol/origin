import verifyOAuth2Code from './../../utils/verifyOAuth2Code'

function verifyFacebook(_, { identity, authUrl, redirect, code }) {
  return verifyOAuth2Code('facebook', { identity, authUrl, redirect, code })
}

export default verifyFacebook
