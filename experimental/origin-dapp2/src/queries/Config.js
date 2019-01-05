import gql from 'graphql-tag'

export default gql`
  query Config {
    config {
      discovery
    }
  }
`
