import gql from 'graphql-tag'

export default gql`
  mutation VerifyFacebook(
    $identity: String!
    $authUrl: String
    $redirect: Boolean
    $code: String
  ) {
    verifyFacebook(
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
