import gql from 'graphql-tag'

export default gql`
  mutation SetNetwork($network: String!, $customConfig: ConfigInput) {
    setNetwork(network: $network, customConfig: $customConfig)
  }
`
