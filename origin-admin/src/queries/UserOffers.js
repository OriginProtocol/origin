import gql from 'graphql-tag'

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
`

export default UserOffersQuery
