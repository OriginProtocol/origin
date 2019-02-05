import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Listing($listingId: ID!) {
    web3 {
      metaMaskAccount {
        id
      }
    }
    marketplace {
      listing(id: $listingId) {
        # START workaround
        # graphql-tools' mergeSchemas doesn't merge without errors, so this
        # workaround is required
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
        # START workaround
      }
    }
  }
  ${fragments.Listing.basic}
`
