import gql from 'graphql-tag'

export default gql`
  query Room($id: String!) {
    messaging(id: "defaultAccount") {
      enabled
      conversation(id: $id) {
        id
        timestamp
        messages {
          address
          msg {
            content
            created
          }
        }
      }
    }
  }
`
