import gql from 'graphql-tag'

export default gql`
  subscription onMessageAdded {
    messageAdded {
      conversationId
      roomId
      message {
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
    }
  }
`
