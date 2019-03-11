import gql from 'graphql-tag'

export default gql`
  query UserNotifications($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
        notifications(first: $first, after: $after) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
          }
          nodes {
            id
            party {
              id
            }
            event {
              id
              event
              timestamp
              transactionHash
            }
            offer {
              id
              createdBlock
              listing {
                ... on Listing {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`
