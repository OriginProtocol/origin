import gql from 'graphql-tag'

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

export const identity = gql`
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

export const wallet = gql`
  query Wallet($id: ID!) {
    web3 {
			account(id: $id) {
        id
        owner {
          id
        }
        proxy {
          id
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
          id
          balance
          token {
            id
            decimals
          }
        }
      }
    }
  }
`
