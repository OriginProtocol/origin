import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query CounterpartyEvents($user: ID!, $counterparty: String!) {
    marketplace {
      user(id: $user) {
        id
        counterparty(id: $counterparty) {
          nodes {
            id
            event {
              event
              timestamp
              returnValues {
                party
              }
            }
            offer {
              ...basicOfferFields
              listing {
                ...basicListingFields
              }
            }
          }
        }
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
