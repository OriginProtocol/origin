import gql from 'graphql-tag'

export default gql`
  query SkinnyIdentity($id: ID!) {
    identity(id: $id) {
      id
      firstName
      lastName
      fullName
      description
      avatarUrl
      avatarUrlExpanded
      strength
      attestations

      verifiedAttestations {
        id
        rawData
        properties {
          type
          value
        }
      }
    }
  }
`
