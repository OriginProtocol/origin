import gql from 'graphql-tag'

export default gql`
  query Config {
    config
    configObj {
      affiliate
      arbitrator
      discovery
      bridge
      ipfsRPC
      ipfsGateway
      ipfsEventCache
      provider
      providerWS
      proxyAccountsEnabled
      relayerEnabled
      originGraphQLVersion
      relayer
      performanceMode
    }
  }
`
