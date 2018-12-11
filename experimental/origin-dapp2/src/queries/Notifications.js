import gql from 'graphql-tag'

export default gql`
  query Notifications {
    notifications {
      totalCount
      totalUnread
      nodes {
        id
        title
        timestamp
        content
      }
    }
  }
`
