import gql from 'graphql-tag'

export default gql`
  mutation SendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      id
    }
  }
`
