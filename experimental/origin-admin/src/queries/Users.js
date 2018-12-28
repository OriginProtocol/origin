import gql from 'graphql-tag'

const UsersQuery = gql`
  query Users($first: Int, $after: String, $sort: String) {
    marketplace {
      users(first: $first, after: $after, sort: $sort) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
        nodes {
          id
          firstEvent {
            id
            timestamp
          }
          lastEvent {
            id
            timestamp
          }
          offers {
            totalCount
          }
          listings {
            totalCount
          }
        }
      }
    }
  }
`

export default UsersQuery
