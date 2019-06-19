import gql from 'graphql-tag'

export default gql`
  mutation VerifyOAuthAttestation(
    $provider: String!
    $identity: String!
    $authUrl: String
    $redirect: String
    $code: String
  ) {
    verifyOAuthAttestation(
      provider: $provider
      identity: $identity
      authUrl: $authUrl
      redirect: $redirect
      code: $code
    ) {
      success
      reason
      data
    }
  }
`
