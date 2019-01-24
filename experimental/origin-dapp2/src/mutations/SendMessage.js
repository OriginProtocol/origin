import gql from 'graphql-tag'

export default gql`
  mutation SendMessage($to: String!, $content: String, $media: [MediaInput]) {
    sendMessage(to: $to, content: $content, media: $media) {
      id
    }
  }
`
