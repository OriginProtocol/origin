import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query AllListings(
    $first: Int
    $after: String
    $sort: String
    $order: String
    $search: String
    $filters: [ListingFilterInput!]
    $listingIds: [String]
  ) {
    marketplace {
      listings(
        first: $first
        after: $after
        sort: $sort
        search: $search
        filters: $filters
        listingIds: $listingIds
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
