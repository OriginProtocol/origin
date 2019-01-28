import gql from 'graphql-tag'

export default gql`
  query AllContracts {
    marketplaces {
      address
      totalListings
      version
      token {
        id
      }
      owner {
        id
      }
    }
    tokens {
      id
      symbol
      address
      name
      decimals
      totalSupply
    }
    userRegistry {
      id
    }
  }
`
