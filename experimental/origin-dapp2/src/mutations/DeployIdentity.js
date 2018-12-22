import gql from 'graphql-tag'

export default gql`
  mutation DeployIdentity(
    $from: String!
    $profile: ProfileInput
    $attestations: [AttestationInput]
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
