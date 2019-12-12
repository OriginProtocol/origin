import gql from 'graphql-tag'

export default gql`
  mutation Enroll(
    $agreementMessage: String!
    $inviteCode: String
    $fingerprintData: JSON
  ) {
    enroll(
      agreementMessage: $agreementMessage
      inviteCode: $inviteCode
      fingerprintData: $fingerprintData
    ) {
      authToken
      isBanned
    }
  }
`
