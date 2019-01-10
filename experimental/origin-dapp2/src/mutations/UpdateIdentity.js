import gql from 'graphql-tag'

export default gql`
  mutation UpdateIdentity(
    $from: String!
    $identity: String!
    $profile: ProfileInput
    $attestations: [AttestationInput]
  ) {
    updateIdentity(
      from: $from
      identity: $identity
      attestations: $attestations
      profile: $profile
    ) {
      id
    }
  }
`
