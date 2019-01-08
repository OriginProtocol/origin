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
      metaMaskNetworkName
      metaMaskAccount {
        id
        checksumAddress
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
    let currentState
    config.metaMask.currentProvider.publicConfigStore.on('update', state => {
      // console.log("MM Update", ok)
      if (currentState === JSON.stringify(state)) {
        return
      }
      currentState = JSON.stringify(state)
      client
        .query({
          query: GetMetaMaskStateQuery,
          fetchPolicy: 'network-only'
        })
        .then(() => {})
    })
  }
}
