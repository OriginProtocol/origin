import gql from 'graphql-tag'

export default gql`
  query Network {
    web3 {
      networkName
    }
  }
`
