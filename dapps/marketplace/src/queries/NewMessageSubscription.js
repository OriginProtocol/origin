import gql from 'graphql-tag'

export default gql`
  subscription onMessageAdded {
    messageAdded {
      conversationId
      roomId
      message {
        address
        media {
          url
          contentType
        }
        content
        timestamp
      }
    }
  }
`
