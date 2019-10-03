import gql from 'graphql-tag'

export default gql`
  subscription onMarkedAsRead {
    markedAsRead {
      conversationId
      roomId
      messagesRead
    }
  }
`
