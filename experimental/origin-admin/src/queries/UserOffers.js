import gql from 'graphql-tag'
import fragments from './Fragments'

const UserOffersQuery = gql`
  query UserOffers($id: ID!, $first: Int, $after: String) {
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

export default UserOffersQuery
