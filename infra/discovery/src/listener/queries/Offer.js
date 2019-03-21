const gql = require('graphql-tag')

export default gql`
  query Offer($offerId: ID!) {
    marketplace {
      offer(id: $offerId) {
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
      }
    }
  }
`
