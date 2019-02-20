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
        status
        totalEvents
        seller {
          id
        }
        arbitrator {
          id
        }
        deposit
        depositAvailable
        createdEvent {
          timestamp
        }

        category
        categoryStr
        subCategory
        title
        description
        currencyId
        featured
        hidden
        price {
          amount
          currency
        }
        media {
          url
          contentType
        }
        commission
        commissionPerUnit
        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsSold
        }
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
