const gql = require('graphql-tag')

module.exports = {
  Listing: {
    basic: gql`
      fragment basicListingFields on Listing {
        id
        status
        totalEvents
        seller {
          id
          identity {
            firstName
            lastName
            fullName
          }
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
        marketplacePublisher
        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsSold
        }
        ... on FractionalListing {
          weekendPrice {
            amount
            currency
          }
          timeZone
          workingHours
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
        refund
        commission
        status
        statusStr
        finalizes
        quantity
        valid
        validationError
        arbitrator {
          id
        }
        affiliate {
          id
        }
        buyer {
          id
          identity {
            firstName
            lastName
            fullName
          }
        }
        withdrawnBy {
          id
        }
      }
    `
  }
}
