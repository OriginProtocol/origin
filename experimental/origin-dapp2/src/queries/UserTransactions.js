import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query UserTransactions($id: ID!, $first: Int, $after: String) {
    marketplace {
      user(id: $id) {
        id
        transactions(first: $first, after: $after) {
          totalCount
          nodes {
            ...basicTransactionFields
          }
        }
      }
    }
    web3 {
      blockNumber
    }
  }
  ${fragments.Transaction.basic}
`
