import gql from 'graphql-tag'

export default gql`
  mutation Enroll(
    $accountId: ID!
    $agreementMessage: String!
    $signature: String!
    $inviteCode: String
    $fingerprint: String!
  ) {
    enroll(
      accountId: $accountId
      agreementMessage: $agreementMessage
      signature: $signature
      inviteCode: $inviteCode
      fingerprint: $fingerprint
    ) {
      authToken
      error
    }
  }
`
