import gql from 'graphql-tag'

export default gql`
  mutation LinkMobileWallet {
    linkMobileWallet {
      code
    }
  }
`
