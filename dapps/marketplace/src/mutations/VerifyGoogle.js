import gql from 'graphql-tag'

export default gql`
  mutation VerifyGoogle(
    $identity: String!
    $authUrl: String
    $redirect: Boolean
    $code: String
  ) {
    verifyGoogle(
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
