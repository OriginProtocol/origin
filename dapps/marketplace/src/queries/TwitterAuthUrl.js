import gql from 'graphql-tag'

export default gql`
  query TwitterAuthUrl($redirect: String) {
    identityEvents {
      twitterAuthUrl(redirect: $redirect)
    }
  }
`
