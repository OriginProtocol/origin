import gql from 'graphql-tag'

const GetNodeAccounts = gql`
  {
    web3 {
      nodeAccounts {
        id
      }
    }
  }
`

const GetReceipt = gql`
  query TransactionReceipt($id: String!) {
    web3 {
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

const GetAllOffers = gql`
  query GetAllOffers($id: String!) {
    marketplace {
      listing(id: $id) {
        id
        title
        allOffers {
          id
          status
          statusStr
          valid
          validationError
          commission
        }
      }
    }
  }
`

const GetListing = gql`
query GetListing($id: String!) {
  marketplace {
    listing(id: $id) {
      id
      unitsAvailable
      unitsSold
    }
  }
}
`

export default {
  GetNodeAccounts,
  GetReceipt,
  GetAllOffers,
  GetListing
}
