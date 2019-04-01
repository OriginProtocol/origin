import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Listing($listingId: ID!) {
    web3 {
      primaryAccount {
        id
      }
    }
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
