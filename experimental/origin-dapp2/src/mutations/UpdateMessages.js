import gql from 'graphql-tag'

export default gql`
  mutation UpdateMessages($id: String!, $wallet: String!) {
    updateMessages(id: $id, wallet: $wallet) {
      id
      wallet
    }
  }
`
