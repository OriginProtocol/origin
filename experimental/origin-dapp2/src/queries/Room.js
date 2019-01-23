import gql from 'graphql-tag'

export default gql`
  query Room($id: String!) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversation(id: $id) {
        id
        timestamp
        messages {
          address
          content
          media
          timestamp
        }
      }
    }
  }
`
