import gql from 'graphql-tag'

export default gql`
  query Config {
    config
    configObj {
      affiliate
      arbitrator
      discovery
      growth
      graphql
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
      marketplaceVersion
      messaging {
        globalKeyServer
        messagingNamespace
      }
    }
  }
`
