import gql from 'graphql-tag'

export default gql`
  query Conversations {
    messaging(id: "defaultAccount") {
      enabled
      conversations {
        id
        timestamp
      }
    }
  }
`
