import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query AllListings(
    $first: Int
    $after: String
    $sort: String
    $hidden: Boolean
    $search: String
    $filters: [ListingFilter!]
  ) {
    marketplace {
      listings(
        first: $first
        after: $after
        sort: $sort
        hidden: $hidden
        search: $search
        filters: $filters
      ) {
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
