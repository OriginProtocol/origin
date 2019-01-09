import gql from 'graphql-tag'

export default gql`
  query OfferEvents($offerId: String!) {
    marketplace {
      offer(id: $offerId) {
        id
        events {
          id
          event
          transactionHash
          block {
            id
            timestamp
          }
          returnValues {
            ipfsHash
            party
          }
        }
      }
    }
  }
`
