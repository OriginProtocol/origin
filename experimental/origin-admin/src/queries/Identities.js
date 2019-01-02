import gql from 'graphql-tag'

const IdentitiesQuery = gql`
  query Identities($first: Int, $after: String, $sort: String) {
    userRegistry {
      id
      identities(first: $first, after: $after, sort: $sort) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
        nodes {
          id
          profile {
            id
          }
        }
      }
    }
  }
`

export default IdentitiesQuery
