import gql from 'graphql-tag'

export default gql`
  mutation VerifyPhoneCode(
    $identity: String!
    $prefix: String!
    $phone: String!
    $code: String!
  ) {
    attestationsVerifyPhoneCode(
      identity: $identity
      prefix: $prefix
      phone: $phone
      code: $code
    ) {
      success
      reason
      claimType
      data
      signature
    }
  }
`
