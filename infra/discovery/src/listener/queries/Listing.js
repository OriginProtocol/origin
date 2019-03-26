const gql = require('graphql-tag')

const fragments = require('./Fragments')

module.exports = gql`
  query Listing($listingId: ID!) {
    marketplace {
      listing(id: $listingId) {
        ...basicListingFields
        ... on Listing {
          events {
            id
            event
            blockNumber
            logIndex
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
