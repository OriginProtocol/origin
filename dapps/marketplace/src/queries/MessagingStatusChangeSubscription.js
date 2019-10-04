import gql from 'graphql-tag'

export default gql`
  subscription onMessagingStatusChange {
    messagingStatusChange {
      newStatus
    }
  }
`
