import gql from 'graphql-tag'
import fragments from '../../../fragments'

export default gql`
  query Accounts {
    web3 {
      accounts {
        ...balanceFields
      }
    }
  }
  ${fragments.Account.balance}
`
