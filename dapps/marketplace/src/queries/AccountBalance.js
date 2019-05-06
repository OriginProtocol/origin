import gql from 'graphql-tag'

export default gql`
  query AccountBalance($id: ID!) {
    web3 {
      account(id: $id) {
        id
        balance {
          eth
        }
      }
    }
  }
`
