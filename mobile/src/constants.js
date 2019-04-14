'use strict'

class Enum extends Array {
  constructor(...args) {
    super(...args)

    for (const k of args) {
      this[k] = k
    }
  }
}

export const ACCOUNT_MAPPING = 'ACCOUNT_MAPPING'
export const DEFAULT_NOTIFICATION_PERMISSIONS = {
  alert: true,
  badge: true,
  sound: true
}
export const WALLET_INFO = 'WALLET_INFO'
export const WALLET_PASSWORD = 'WALLET_PASSWORD'
export const WALLET_STORE = 'WALLET_STORE'
export const ETH_NOTIFICATION_TYPES = new Enum('APN', 'FCM', 'Email')
/*
export const NETWORKS = [
  { id: 1, name: 'Mainnet', dappUrl: 'https://dapp.originprotocol.com' },
  { id: 4, name: 'Rinkeby', dappUrl: 'https://dapp.staging.originprotocol.com' },
  { id: 2222, name: 'Origin', dappUrl: 'https://dapp.dev.originprotocol.com' },
  { id: 999, name: 'Localhost', dappUrl: 'http://localhost:3000' }
]
*/

export const NETWORKS = [
  { id: 1, name: 'Mainnet', dappUrl: 'http://localhost:3000/mainnet' },
  { id: 4, name: 'Rinkeby', dappUrl: 'http://localhost:3000/rinkeby' },
  { id: 2222, name: 'Origin', dappUrl: 'http://localhost:3000/origin' }
]

// Push additional networks if in development
// eslint-disable-next-line no-undef
if (__DEV__) {
  NETWORKS.push({
    id: 999,
    name: 'Localhost',
    dappUrl: 'http://localhost:3000'
  })
}
