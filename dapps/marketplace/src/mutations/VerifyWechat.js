import gql from 'graphql-tag'

export default gql`
  mutation VerifyWechat(
    $identity: String!
    $authUrl: String
    $redirect: Boolean
    $code: String
  ) {
    verifyWechat(
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
