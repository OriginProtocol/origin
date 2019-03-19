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
          currency {
            ... on Currency {
              id
              code
            }
          }
        }
        acceptedTokens {
          id
        }
        media {
          url
          urlExpanded
          contentType
        }
        commission
        commissionPerUnit
        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsSold
        }
        ... on FractionalListing {
          weekendPrice {
            amount
            currency {
              ... on Currency {
                id
                code
              }
            }
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
        }
        withdrawnBy {
          id
        }
        totalPrice {
          amount
          currency {
            ... on Currency {
              id
              code
            }
          }
        }
      }
    `
  }
}
