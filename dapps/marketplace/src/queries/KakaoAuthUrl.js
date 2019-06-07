import gql from 'graphql-tag'

export default gql`
  query KakaoAuthUrl($redirect: String) {
    identityEvents {
      kakaoAuthUrl(redirect: $redirect)
    }
  }
`
