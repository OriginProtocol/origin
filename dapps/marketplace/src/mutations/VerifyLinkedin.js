import gql from 'graphql-tag'

export default gql`
  mutation VerifyLinkedin(
    $identity: String!
    $authUrl: String
    $redirect: Boolean
    $code: String
  ) {
    verifyLinkedin(
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
