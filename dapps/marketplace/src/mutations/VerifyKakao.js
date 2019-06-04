import gql from 'graphql-tag'

export default gql`
  mutation VerifyKakao(
    $identity: String!
    $authUrl: String
    $redirect: Boolean
    $code: String
  ) {
    verifyKakao(
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
