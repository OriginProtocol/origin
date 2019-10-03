import gql from 'graphql-tag'

export default gql`
  subscription onMessagingReady {
    messagingReady
  }
`
