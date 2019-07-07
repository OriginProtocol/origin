import gql from 'graphql-tag'

export const identity = gql`
  query Identity($id: ID!) {
    web3 {
      account(id: $id) {
        id
        owner {
          id
        }
        identity {
          id
          firstName
          lastName
          fullName
          description
          avatarUrl
          avatarUrlExpanded
          strength
          attestations
        }
      }
    }
  }
`

export const wallet = gql`
  query Wallet {
    web3 {
      metaMaskAccount {
        id
      }
      walletType
      mobileWalletAccount {
        id
      }
      primaryAccount {
        id
        proxy {
          id
        }
        predictedProxy {
          id
        }
      }
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

export const growthEligible = gql`
  query GrowthEligibility {
    isEligible {
      eligibility
      countryName
      countryCode
    }
  }
`

export const transactionReceipt = gql`
  query TransactionReceipt($id: ID!) {
    web3 {
      blockNumber
      transactionReceipt(id: $id) {
        id
        blockNumber
        events {
          id
          event
          returnValues {
            listingID
            offerID
            party
            ipfsHash
          }
          returnValuesArr {
            field
            value
          }
        }
      }
    }
  }
`
