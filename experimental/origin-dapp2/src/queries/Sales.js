import gql from 'graphql-tag'
import fragments from './Fragments'

const SalesQuery = gql`
  query Sales($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
        sales(first: $first, after: $after) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
          }
          nodes {
            ...basicOfferFields
            listing {
              ...basicListingFields
            }
          }
        }
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`

export default SalesQuery
