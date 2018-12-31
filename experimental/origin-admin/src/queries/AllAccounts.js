import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query AllAccounts {
    web3 {
      defaultAccount {
        ...balanceFields
      }
      nodeAccounts {
        ...balanceFields
      }
      accounts {
        ...balanceFields
      }
    }
  }
  ${fragments.Account.balance}
`
