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
      }
      primaryAccount {
        id
      }
      walletType
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
    configStore.on('update', () => {
      // console.log('MM Update', state)
      client
        .query({
          query: GetMetaMaskStateQuery,
          fetchPolicy: 'network-only'
        })
        .then(() => {})
    })
  }
}
