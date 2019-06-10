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

export const balance = gql`
  query Balance($id: ID!) {
    web3 {
      account(id: $id) {
        id
        balance {
          eth
        }
      }
    }
  }
`

export const tokenBalance = gql`
  query Balance($id: ID!, $token: String!) {
    web3 {
      account(id: $id) {
        id
        token(symbol: $token) {
          balance
          token {
            decimals
          }
        }
      }
    }
  }
`
