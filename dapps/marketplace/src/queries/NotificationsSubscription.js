import gql from 'graphql-tag'

export default gql`
  subscription onNewNotification {
    newNotification {
      totalCount
      totalUnread
      node {
        id
        title
        timestamp
        content
      }
    }
  }
`
