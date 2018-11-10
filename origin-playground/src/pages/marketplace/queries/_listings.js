import gql from 'graphql-tag'
import fragments from '../../../fragments'

export default gql`
  query AllListings($offset: Int, $limit: Int) {
    marketplace {
      totalListings
      allListings(offset: $offset, limit: $limit) {
        ...basicListingFields
      }
    }
  }
  ${fragments.Listing.basic}
`
