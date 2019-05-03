import gql from 'graphql-tag'

export default gql`
  query FacebookAuthUrl($redirect: String) {
    identityEvents {
      facebookAuthUrl(redirect: $redirect)
    }
  }
`
