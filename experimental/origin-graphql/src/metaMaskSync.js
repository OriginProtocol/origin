/**
 * Keeps MetaMask in sync with GraphQL cache
 */

import gql from 'graphql-tag'
import config from './contracts'

const GetMetaMaskStateQuery = gql`
  query GetMetaMaskState {
    web3 {
      useMetaMask
      metaMaskAvailable
      metaMaskApproved
      metaMaskEnabled
      metaMaskUnlocked
      metaMaskNetworkId
      metaMaskAccount {
        id
        balance {
          eth
        }
      }
    }
  }
`

export default function(client) {
  if (config.metaMask && config.metaMask.currentProvider) {
    // config.metaMask.currentProvider.publicConfigStore.on('controllerConnectionChanged', () => {
    //   console.log("MM End")
    // })
    // config.metaMask.currentProvider.publicConfigStore.on('notification', () => {
    //   console.log("MM Notification")
    // })
    config.metaMask.currentProvider.publicConfigStore.on('update', () => {
      // console.log("MM Update")
      client
        .query({
          query: GetMetaMaskStateQuery,
          fetchPolicy: 'network-only'
        })
        .then(() => {})
    })
  }
}
