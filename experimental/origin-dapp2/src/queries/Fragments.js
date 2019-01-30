import gql from 'graphql-tag'

export default {
  Account: {
    balance: gql`
      fragment balanceFields on Account {
        id
        role
        name
        balance {
          eth
          wei
        }
        ogn: token(symbol: "OGN") {
          id
          balance
        }
      }
    `
  },
  Listing: {
    basic: gql`
      fragment basicListingFields on Listing {
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
        ... on UnitListing {
          multiUnit
          unitsTotal
          unitsAvailable
          unitsSold
        }
        ... on FractionalListing {
          weekendPrice {
            amount
            currency
          }
          booked
          customPricing
          unavailable
        }
      }
    `
  },
  Offer: {
    basic: gql`
      fragment basicOfferFields on Offer {
        id
        listingId
        offerId
        value
        currency
        quantity
        refund
        commission
        status
        finalizes
        arbitrator {
          id
        }
        affiliate {
          id
        }
        buyer {
          id
        }
        withdrawnBy {
          id
        }
        createdEvent {
          timestamp
        }
        acceptedEvent {
          timestamp
        }
        finalizedEvent {
          timestamp
        }
        withdrawnEvent {
          timestamp
        }
        disputedEvent {
          timestamp
        }
        rulingEvent {
          timestamp
        }
        statusStr
        startDate
        endDate
      }
    `
  },
  Transaction: {
    basic: gql`
      fragment basicTransactionFields on Transaction {
        id
        status
        submittedAt
        blockNumber
        receipt {
          id
          events {
            id
            event
            returnValues {
              listingID
              offerID
              party
            }
          }
        }
      }
    `
  }
}
