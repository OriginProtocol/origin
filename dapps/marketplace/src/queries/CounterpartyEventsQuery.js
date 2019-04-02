import gql from 'graphql-tag'

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
              id
              buyer {
                id
              }
              listing {
                ... on Listing {
                  id
                  title
                  seller {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
