import gql from 'graphql-tag'

export default gql`
  query Reviews($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
        reviews(first: $first, after: $after) {
          totalCount
          nodes {
            id
            review
            rating
            reviewer {
              id
              account {
                id
                identity {
                  id
                  fullName
                  avatarUrlExpanded
                }
              }
            }
            listing {
              ... on Listing {
                id
                title
              }
            }
            event {
              id
              timestamp
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    }
  }
`
