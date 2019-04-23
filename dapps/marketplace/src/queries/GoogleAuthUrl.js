import gql from 'graphql-tag'

export default gql`
  query GoogleAuthUrl {
    identityEvents {
      googleAuthUrl
    }
  }
`
