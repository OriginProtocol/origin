import gql from 'graphql-tag'
import fragments from '../../../fragments'

export default gql`
  query AllListings($first: Int, $after: String) {
    marketplace {
      listings(first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
        nodes {
          ...basicListingFields
        }
      }
    }
  }
  ${fragments.Listing.basic}
`
