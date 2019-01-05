import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  subscription onNewTransaction {
    newTransaction {
      totalCount
      node {
        ...basicTransactionFields
      }
    }
  }
  ${fragments.Transaction.basic}
`
