import verifyOAuth2Code from './../../utils/verifyOAuth2Code'

function verifyKakao(_, { identity, authUrl, redirect, code }) {
  return verifyOAuth2Code('kakao', { identity, authUrl, redirect, code })
}

export default verifyKakao
