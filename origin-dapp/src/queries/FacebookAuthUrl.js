import gql from 'graphql-tag'

export default gql`
  query FacebookAuthUrl {
    identityEvents {
      facebookAuthUrl
    }
  }
`
