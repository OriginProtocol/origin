import gql from 'graphql-tag'

export default gql`
  query Room($id: String!) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversation(id: $id) {
        id
        timestamp
        totalUnread
        messages {
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
      }
    }
  }
`
