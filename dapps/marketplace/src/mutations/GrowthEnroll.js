import gql from 'graphql-tag'

export default gql`
  mutation Enroll(
    $accountId: ID!
    $agreementMessage: String!
    $signature: String!
    $inviteCode: String
    $fingerprintData: JSON
  ) {
    enroll(
      accountId: $accountId
      agreementMessage: $agreementMessage
      signature: $signature
      inviteCode: $inviteCode
      fingerprintData: $fingerprintData
    ) {
      authToken
      isBanned
    }
  }
`
