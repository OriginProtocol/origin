const gql = require('graphql-tag')
const fragments = require('./Fragments')

const listingQuery = gql`
  query Listing($listingId: ID!) {
    marketplace {
      listing(id: $listingId) {
        ...basicListingFields
        ... on Listing {
          events {
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
    }
  }

  ${fragments.Listing.basic}
`

module.exports = { listingQuery }
