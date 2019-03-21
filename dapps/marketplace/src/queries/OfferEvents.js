import gql from 'graphql-tag'

export default gql`
  query OfferEvents($offerId: ID!) {
    marketplace {
      offer(id: $offerId) {
        id
        history {
          id
          event {
            id
            event
            block {
              id
              timestamp
            }
          }
          ipfsHash
          ipfsUrl
        }
      }
    }
  }
`
