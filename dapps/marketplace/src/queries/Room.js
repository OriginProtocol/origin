import gql from 'graphql-tag'

export default gql`
  query Room($id: String!, $before: Int, $after: Int) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversation(id: $id, before: $before, after: $after) {
        id
        timestamp
        totalUnread
        messages {
          index
          address
          content
          status
          hash
          media {
            url
            contentType
          }
          timestamp
        }
        hasMore
      }
    }
  }
`
