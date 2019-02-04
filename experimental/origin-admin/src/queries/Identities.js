import gql from 'graphql-tag'

const IdentitiesQuery = gql`
  query Identities($first: Int, $after: String, $sort: String) {
    identityEvents {
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
          fullName
        }
      }
    }
  }
`

export default IdentitiesQuery
