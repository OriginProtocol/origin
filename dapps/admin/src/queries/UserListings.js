import gql from 'graphql-tag'
import fragments from './Fragments'

const UserListingsQuery = gql`
  query UserListings($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
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
  }
  ${fragments.Listing.basic}
`

export default UserListingsQuery
