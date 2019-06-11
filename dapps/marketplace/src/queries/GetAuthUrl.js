import gql from 'graphql-tag'

export default gql`
  query GetAuthUrl($provider: String!, $redirect: String) {
    identityEvents {
      getAuthUrl(provider: $provider, redirect: $redirect)
    }
  }
`
