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
        createdEvent {
          timestamp
        }

        category
        categoryStr
        title
        description
        currencyId
        unitsTotal
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
        statusStr
      }
    `
  }
}
