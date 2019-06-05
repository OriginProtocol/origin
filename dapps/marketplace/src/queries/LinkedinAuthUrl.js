import gql from 'graphql-tag'

export default gql`
  query LinkedinAuthUrl($redirect: String) {
    identityEvents {
      linkedinAuthUrl(redirect: $redirect)
    }
  }
`
