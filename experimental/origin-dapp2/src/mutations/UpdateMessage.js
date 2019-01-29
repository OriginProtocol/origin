import gql from 'graphql-tag'

export default gql`
  mutation UpdateMessage($status: String!, $hash: String!) {
    updateMessage(status: $status, hash: $hash) {
      status
      hash
    }
  }
`
