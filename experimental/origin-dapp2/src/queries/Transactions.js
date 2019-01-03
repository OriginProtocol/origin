import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Transactions {
    web3 {
      metaMaskAccount {
        id
      }
      transactions {
        totalCount
        nodes {
          ...basicTransactionFields
        }
      }
    }
  }
  ${fragments.Transaction.basic}
`
