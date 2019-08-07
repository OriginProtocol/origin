import gql from 'graphql-tag'

export default gql`
  mutation VerifyTelegramCode(
    $identity: String!
    $phone: String!
    $code: String!
  ) {
    verifyTelegramCode(identity: $identity, phone: $phone, code: $code) {
      success
      reason
      data
    }
  }
`
