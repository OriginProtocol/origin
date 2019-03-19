import gql from 'graphql-tag'

export default gql`
  query AllEvents($offset: Int, $limit: Int) {
    marketplace {
      totalEvents
      events(offset: $offset, limit: $limit) {
        id
        event
        blockNumber
        block {
          id
          timestamp
        }
        returnValues {
          ipfsHash
          party
          offerID
          listingID
        }
      }
    }
  }
`
