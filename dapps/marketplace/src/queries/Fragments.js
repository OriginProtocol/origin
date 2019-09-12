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
        contractAddr
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
        requiresShipping
        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsSold
          unitsPending
          multiUnit
        }
        ... on ServiceListing {
          unitsSold
          unitsPending
          unitsAvailable
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
        ... on GiftCardListing {
          unitsTotal
          unitsAvailable
          unitsSold
          unitsPending
          multiUnit
          retailer
          cardAmount
          issuingCountry
          isDigital
          isCashPurchase
          receiptAvailable
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
        shippingAddressEncrypted
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
          ... on ListingIdPurchasedAction {
            listingId
            titleKey
            detailsKey
            iconSrc
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
            limit
            invites {
              nodes {
                pendingId
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
          ... on SocialShareAction {
            content {
              id
              titleKey
              detailsKey
              image
              link
              linkKey
              post {
                tweet {
                  default
                  translations {
                    locale
                    text
                  }
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
