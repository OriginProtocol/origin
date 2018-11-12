/**
 * Keeps MetaMask in sync with GraphQL cache
 */

import gql from 'graphql-tag'
import config from './contracts'

const GetMetaMaskStateQuery = gql`
  query GetMetaMaskState {
    web3 {
      metaMaskAvailable
      metaMaskEnabled
      metaMaskNetworkId
      metaMaskAccount {
        id
      }
    }
  }
`

export default function(client) {
  if (config.metaMask && config.metaMask.currentProvider) {
    config.metaMask.currentProvider.publicConfigStore.on('update', () => {
      client
        .query({
          query: GetMetaMaskStateQuery,
          fetchPolicy: 'network-only'
        })
        .then(() => {})
    })
  }
}
