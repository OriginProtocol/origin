import gql from 'graphql-tag'

export default gql`
  query Identity($id: ID!) {
    web3 {
      account(id: $id) {
        id
        identity {
          id
          profile {
            id
            firstName
            lastName
            fullName
            description
            avatar
            strength

            facebookVerified
            twitterVerified
            airbnbVerified
            phoneVerified
            emailVerified
          }
        }
      }
    }
  }
`
