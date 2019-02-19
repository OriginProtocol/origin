/**
 * Keeps MetaMask in sync with GraphQL cache
 */

import gql from 'graphql-tag'
import config from './contracts'
import get from 'lodash/get'

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
  const configStore = get(config, 'metaMask.currentProvider.publicConfigStore')
  if (configStore) {
    // configStore.on('controllerConnectionChanged', () => {
    //   console.log("MM End")
    // })
    // configStore.on('notification', () => {
    //   console.log("MM Notification")
    // })
    let currentState
    configStore.on('update', state => {
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
