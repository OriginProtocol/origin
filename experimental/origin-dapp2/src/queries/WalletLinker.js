import gql from 'graphql-tag'

export default gql`
  query WalletLinker {
    walletLinker {
      linkCode
      linked
    }
  }
`
