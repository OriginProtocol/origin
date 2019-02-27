import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Listing($listingId: ID!) {
    marketplace {
      listing(id: $listingId) {
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
      }
    }
  }

  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
