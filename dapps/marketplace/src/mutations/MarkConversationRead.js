import gql from 'graphql-tag'

export default gql`
  mutation MarkConversationRead($id: String!) {
    markConversationRead(id: $id)
  }
`
