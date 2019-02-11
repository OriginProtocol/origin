import gql from 'graphql-tag'

export default gql`
  mutation VerifyEmailCode(
    $identity: String!
    $email: String!
    $code: String!
  ) {
    verifyEmailCode(identity: $identity, email: $email, code: $code) {
      success
      reason
      data
    }
  }
`
