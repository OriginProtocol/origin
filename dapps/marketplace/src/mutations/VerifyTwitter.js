import gql from 'graphql-tag'

export default gql`
  mutation VerifyTwitter(
    $identity: String!
    $redirect: Boolean
    $authUrl: String
    $code: String
  ) {
    verifyTwitter(
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
