import gql from 'graphql-tag'

export default gql`
  query GithubAuthUrl($redirect: String) {
    identityEvents {
      githubAuthUrl(redirect: $redirect)
    }
  }
`
