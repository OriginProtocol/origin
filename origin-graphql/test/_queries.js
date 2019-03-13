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
  query TransactionReceipt($id: ID!) {
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
  query GetAllOffers($id: ID!) {
    marketplace {
      listing(id: $id) {
        ... on Listing {
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
  }
`

const GetListing = gql`
  query GetListing($id: ID!) {
    marketplace {
      listing(id: $id) {
        ... on Listing {
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
            urlExpanded
            contentType
          }
          commission
          commissionPerUnit
        }
        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsPending
          unitsSold
        }
        ... on FractionalListing {
          weekendPrice {
            amount
            currency
          }
          timeZone
          booked
          customPricing
          unavailable
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
