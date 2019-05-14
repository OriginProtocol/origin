import gql from 'graphql-tag'

export default gql`
  query Owner($id: ID!) {
    web3 {
      account(id: $id) {
        id
        owner {
          id
        }
      }
    }
  }
`
