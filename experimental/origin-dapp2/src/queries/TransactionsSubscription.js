import gql from 'graphql-tag'

export default gql`
  subscription onNewTransaction {
    newTransaction {
      id
      status
      mutation
      confirmations
    }
  }
`
