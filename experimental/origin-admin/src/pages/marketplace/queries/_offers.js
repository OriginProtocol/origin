import gql from 'graphql-tag'
import fragments from '../../../fragments'

export default gql`
  query Listing($listingId: String!) {
    marketplace {
      listing(id: $listingId) {
        ...basicListingFields
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
        offers {
          ...basicOfferFields
        }
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
