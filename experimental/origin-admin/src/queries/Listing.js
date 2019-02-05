import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Listing($listingId: ID!) {
    marketplace {
      listing(id: $listingId) {
        # START workaround
        # graphql-tools' mergeSchemas doesn't merge without errors, so this
        # workaround is required
        ...basicListingFields
        ... on Listing {
          allOffers {
            ...basicOfferFields
          }
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
        # END workaround
      }
    }
  }

  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
