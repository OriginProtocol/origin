import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query AllListings(
    $first: Int
    $after: String
    $sort: String
    $search: String
  ) {
    marketplace {
      listings(first: $first, after: $after, sort: $sort, search: $search) {
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
