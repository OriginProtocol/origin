import gql from 'graphql-tag'

export default gql`
  query Room($id: String!, $wallet: String) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversation(id: $id, wallet: $wallet) {
        id
        timestamp
        totalUnread(wallet: $wallet)
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
