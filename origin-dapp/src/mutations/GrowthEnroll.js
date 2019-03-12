import gql from 'graphql-tag'

export default gql`
  mutation Enroll(
    $accountId: ID!
    $agreementMessage: String!
    $signature: String!,
    $inviteCode: String!
  ) {
    enroll(
      accountId: $accountId
      agreementMessage: $agreementMessage
      signature: $signature
      inviteCode: $inviteCode
    ) {
      authToken
      error
    }
  }
`
