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
        valid
        validationError
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
        pendingBuyers {
          id
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
          unitsPending
          multiUnit
        }
        ... on FractionalListing {
          weekendPrice {
            amount
            currency {
              ... on Currency {
                id
              }
            }
          }
          booked
          customPricing
          unavailable
        }
        ... on FractionalHourlyListing {
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
          returnValues {
            party
          }
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
        totalPrice {
          amount
          currency {
            ... on Currency {
              id
            }
          }
        }
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
  },
  GrowthCampaign: {
    basic: gql`
      fragment basicCampaignFields on GrowthCampaign {
        id
        nameKey
        shortNameKey
        startDate
        endDate
        distributionDate
        status
        actions {
          type
          status
          rewardEarned {
            amount
            currency
          }
          reward {
            amount
            currency
          }
          unlockConditions {
            messageKey
            iconSource
          }
          ... on ReferralAction {
            rewardPending {
              amount
              currency
            }
            rewardEarned {
              amount
              currency
            }
            invites {
              nodes {
                id
                status
                walletAddress
                contact
                reward {
                  amount
                  currency
                }
              }
            }
          }
        }
        rewardEarned {
          amount
          currency
        }
      }
    `
  }
}
