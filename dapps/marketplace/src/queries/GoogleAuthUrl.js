import gql from 'graphql-tag'

export default gql`
  query GoogleAuthUrl($redirect: String) {
    identityEvents {
      googleAuthUrl(redirect: $redirect)
    }
  }
`
