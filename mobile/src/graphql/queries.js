import gql from 'graphql-tag'

export const identity = gql`
  query Identity($id: ID!) {
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

      facebookVerified
      googleVerified
      twitterVerified
      airbnbVerified
      phoneVerified
      emailVerified
      websiteVerified
    }
  }
`
