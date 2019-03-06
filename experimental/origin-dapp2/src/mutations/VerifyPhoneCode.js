import gql from 'graphql-tag'

export default gql`
  mutation VerifyPhoneCode(
    $identity: String!
    $prefix: String!
    $phone: String!
    $code: String!
  ) {
    verifyPhoneCode(
      identity: $identity
      prefix: $prefix
      phone: $phone
      code: $code
    ) {
      success
      reason
      data
    }
  }
`
