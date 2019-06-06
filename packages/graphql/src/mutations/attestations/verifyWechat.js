import verifyOAuth2Code from './../../utils/verifyOAuth2Code'

function verifyWechat(_, { identity, authUrl, redirect, code }) {
  return verifyOAuth2Code('linkedin', { identity, authUrl, redirect, code })
}

export default verifyWechat
