import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query AllListings(
    $first: Int
    $after: String
    $sort: String
    $search: String
    $filters: [ListingFilterInput!]
  ) {
    marketplace {
      listings(
        first: $first
        after: $after
        sort: $sort
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
