import gql from 'graphql-tag'

export default gql`
  query Config {
    config
    configObj {
      discovery
      ipfsRPC
      ipfsGateway
      ipfsEventCache
      provider
      providerWS
      originGraphQLVersion
    }
  }
`
