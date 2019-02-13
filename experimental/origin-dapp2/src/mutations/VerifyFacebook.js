import gql from 'graphql-tag'

export default gql`
  mutation VerifyFacbook($identity: String!, $authUrl: String) {
    verifyFacebook(identity: $identity, authUrl: $authUrl) {
      success
      reason
      data
    }
  }
`
