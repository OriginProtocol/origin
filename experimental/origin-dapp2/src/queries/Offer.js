import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Offer($offerId: String!) {
    marketplace {
      offer(id: $offerId) {
        listing {
          ...basicListingFields
        }
        ...basicOfferFields
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
