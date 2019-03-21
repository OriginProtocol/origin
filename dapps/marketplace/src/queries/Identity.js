import gql from 'graphql-tag'

export default gql`
  query Identity($id: ID!) {
    web3 {
      account(id: $id) {
        id
        identity {
          id
          firstName
          lastName
          fullName
          description
          avatar
          strength
          attestations

          facebookVerified
          twitterVerified
          airbnbVerified
          phoneVerified
          emailVerified
        }
      }
    }
  }
`
