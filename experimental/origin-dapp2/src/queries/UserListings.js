import gql from 'graphql-tag'
import fragments from './Fragments'

const UserListingsQuery = gql`
  query UserListings(
    $id: ID!,
    $first: Int,
    $after: String,
    $filters: [ListingFilterInput!]
  ) {
    marketplace {
      user(id: $id) {
        id
        listings(first: $first, after: $after, filters: $filters) {
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
  }
  ${fragments.Listing.basic}
`

export default UserListingsQuery
