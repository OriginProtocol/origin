import gql from 'graphql-tag'
import fragments from '../../../fragments'

const UserListingsQuery = gql`
  query UserListings($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
        offers(first: $first, after: $after) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
          }
          nodes {
            id
            listingId
            offerId
            listing {
              id
              title
            }
          }
        }
      }
    }
  }
  ${fragments.Listing.basic}
`

export default UserListingsQuery
