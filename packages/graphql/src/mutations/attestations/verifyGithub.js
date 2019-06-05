import verifyOAuth2Code from './../../utils/verifyOAuth2Code'

function verifyGithub(_, { identity, authUrl, redirect, code }) {
  return verifyOAuth2Code('github', { identity, authUrl, redirect, code })
}

export default verifyGithub
