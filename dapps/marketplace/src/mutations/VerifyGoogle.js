import gql from 'graphql-tag'

export default gql`
  mutation VerifyGoogle($identity: String!, $authUrl: String) {
    verifyGoogle(identity: $identity, authUrl: $authUrl) {
      success
      reason
      data
    }
  }
`
