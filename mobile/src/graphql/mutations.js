import gql from 'graphql-tag'

export const deployIdentity = gql`
  mutation DeployIdentity(
    $from: String!
    $profile: ProfileInput
    $attestations: [String]
  ) {
    deployIdentity(
      from: $from
      attestations: $attestations
      profile: $profile
    ) {
      id
    }
  }
`

export const growthEnroll = gql`
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
